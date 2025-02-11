# frozen_string_literal: true
require 'spec_helper'

RSpec.describe 'Query.project.pipeline' do
  include GraphqlHelpers

  let_it_be(:project) { create(:project, :repository, :public) }
  let_it_be(:user) { create(:user) }

  def all(*fields)
    fields.flat_map { |f| [f, :nodes] }
  end

  describe '.stages.groups.jobs' do
    let(:pipeline) do
      pipeline = create(:ci_pipeline, project: project, user: user)
      stage = create(:ci_stage_entity, project: project, pipeline: pipeline, name: 'first', position: 1)
      create(:ci_build, stage_id: stage.id, pipeline: pipeline, name: 'my test job')

      pipeline
    end

    let(:jobs_graphql_data) { graphql_data_at(:project, :pipeline, *all(:stages, :groups, :jobs)) }

    let(:first_n) { var('Int') }

    let(:query) do
      with_signature([first_n], wrap_fields(query_graphql_path([
        [:project,  { full_path: project.full_path }],
        [:pipeline, { iid: pipeline.iid.to_s }],
        [:stages,   { first: first_n }]
      ], stage_fields)))
    end

    let(:stage_fields) do
      <<~FIELDS
      nodes {
        name
        groups {
          nodes {
            detailedStatus {
              id
            }
            name
            jobs {
              nodes {
                name
                needs {
                  nodes { #{all_graphql_fields_for('CiBuildNeed')} }
                }
                previousStageJobsAndNeeds {
                  nodes {
                    name
                  }
                }
                detailedStatus {
                  id
                }
                pipeline {
                  id
                }
              }
            }
          }
        }
      }
      FIELDS
    end

    it 'returns the jobs of a pipeline stage' do
      post_graphql(query, current_user: user)

      expect(jobs_graphql_data).to contain_exactly(a_hash_including('name' => 'my test job'))
    end

    context 'when there is more than one stage and job needs' do
      before do
        build_stage = create(:ci_stage_entity, position: 2, name: 'build', project: project, pipeline: pipeline)
        test_stage = create(:ci_stage_entity, position: 3, name: 'test', project: project, pipeline: pipeline)
        deploy_stage = create(:ci_stage_entity, position: 4, name: 'deploy', project: project, pipeline: pipeline)

        create(:ci_build, pipeline: pipeline, stage_idx: build_stage.position, name: 'docker 1 2', stage: build_stage)
        create(:ci_build, pipeline: pipeline, stage_idx: build_stage.position, name: 'docker 2 2', stage: build_stage)
        create(:ci_build, pipeline: pipeline, stage_idx: test_stage.position, name: 'rspec 1 2', stage: test_stage)
        test_job = create(:ci_bridge, pipeline: pipeline, stage_idx: test_stage.position, name: 'rspec 2 2', stage: test_stage)
        create(:ci_build, pipeline: pipeline, stage_idx: deploy_stage.position, name: 'deploy 1 2', stage: deploy_stage)
        deploy_job = create(:ci_build, pipeline: pipeline, stage_idx: deploy_stage.position, name: 'deploy 2 2', stage: deploy_stage)

        create(:ci_build_need, build: test_job, name: 'my test job')
        create(:ci_build_need, build: deploy_job, name: 'rspec 1 2')
      end

      it 'reports the build needs and previous stages with no duplicates', quarantine: 'https://gitlab.com/gitlab-org/gitlab/-/issues/346433' do
        post_graphql(query, current_user: user)

        expect(jobs_graphql_data).to contain_exactly(
          a_hash_including(
            'name' => 'my test job',
            'needs' => { 'nodes' => [] },
            'previousStageJobsAndNeeds' => { 'nodes' => [] }
          ),
          a_hash_including(
            'name' => 'docker 1 2',
            'needs' => { 'nodes' => [] },
            'previousStageJobsAndNeeds' => { 'nodes' => [
              { "name" => "my test job" }
            ] }
          ),
          a_hash_including(
            'name' => 'docker 2 2',
            'needs' => { 'nodes' => [] },
            'previousStageJobsAndNeeds' => { 'nodes' => [
              { "name" => "my test job" }
            ] }
          ),
          a_hash_including(
            'name' => 'rspec 1 2',
            'needs' => { 'nodes' => [] },
            'previousStageJobsAndNeeds' => { 'nodes' => [
              { "name" => "docker 1 2" }, { "name" => "docker 2 2" }
            ] }
          ),
          a_hash_including(
            'name' => 'rspec 2 2',
            'needs' => { 'nodes' => [a_hash_including('name' => 'my test job')] },
            'previousStageJobsAndNeeds' => { 'nodes' => [
              { "name" => "docker 1 2" }, { "name" => "docker 2 2" }, { "name" => "my test job" }
            ] }
          ),
          a_hash_including(
            'name' => 'deploy 1 2',
            'needs' => { 'nodes' => [] },
            'previousStageJobsAndNeeds' => { 'nodes' => [
              { "name" => "rspec 1 2" }, { "name" => "rspec 2 2" }
            ] }
          ),
          a_hash_including(
            'name' => 'deploy 2 2',
            'needs' => { 'nodes' => [a_hash_including('name' => 'rspec 1 2')] },
            'previousStageJobsAndNeeds' => { 'nodes' => [
              { "name" => "rspec 1 2" }, { "name" => "rspec 2 2" }
            ] }
          )
        )
      end

      it 'does not generate N+1 queries', :request_store, :use_sql_query_cache do
        post_graphql(query, current_user: user)

        control = ActiveRecord::QueryRecorder.new(skip_cached: false) do
          post_graphql(query, current_user: user)
        end

        create(:ci_build, name: 'test-a', pipeline: pipeline)
        create(:ci_build, name: 'test-b', pipeline: pipeline)

        expect do
          post_graphql(query, current_user: user)
        end.not_to exceed_all_query_limit(control)
      end
    end
  end

  describe '.jobs.artifacts' do
    let_it_be(:pipeline) { create(:ci_pipeline, project: project) }

    let(:query) do
      %(
        query {
          project(fullPath: "#{project.full_path}") {
            pipeline(iid: "#{pipeline.iid}") {
              stages {
                nodes {
                  groups{
                    nodes {
                      jobs {
                        nodes {
                          artifacts {
                            nodes {
                              downloadPath
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      )
    end

    context 'when the job is a build' do
      it "returns the build's artifacts" do
        create(:ci_build, :artifacts, pipeline: pipeline)

        post_graphql(query, current_user: user)

        job_data = graphql_data_at(:project, :pipeline, :stages, :nodes, :groups, :nodes, :jobs, :nodes).first
        expect(job_data.dig('artifacts', 'nodes').count).to be(2)
      end
    end

    context 'when the job is not a build' do
      it 'returns nil' do
        create(:ci_bridge, pipeline: pipeline)

        post_graphql(query, current_user: user)

        job_data = graphql_data_at(:project, :pipeline, :stages, :nodes, :groups, :nodes, :jobs, :nodes).first
        expect(job_data['artifacts']).to be_nil
      end
    end
  end
end
