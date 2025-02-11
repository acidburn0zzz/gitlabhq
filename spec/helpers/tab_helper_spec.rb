# frozen_string_literal: true

require 'spec_helper'

RSpec.describe TabHelper do
  include ApplicationHelper

  describe 'gl_tabs_nav' do
    it 'creates a tabs navigation' do
      expect(helper.gl_tabs_nav).to match(%r{<ul class=".*" role="tablist"><\/ul>})
    end

    it 'captures block output' do
      expect(helper.gl_tabs_nav { "block content" }).to match(/block content/)
    end

    it 'adds styles classes' do
      expect(helper.gl_tabs_nav).to match(/class="nav gl-tabs-nav"/)
    end

    it 'adds custom class' do
      expect(helper.gl_tabs_nav(class: 'my-class' )).to match(/class=".*my-class.*"/)
    end
  end

  describe 'gl_tab_link_to' do
    before do
      allow(helper).to receive(:current_page?).and_return(false)
    end

    it 'creates a tab' do
      expect(helper.gl_tab_link_to('Link', '/url')).to eq('<li class="nav-item" role="presentation"><a class="nav-link gl-tab-nav-item" href="/url">Link</a></li>')
    end

    it 'creates a tab with block output' do
      expect(helper.gl_tab_link_to('/url') { 'block content' }).to match(/block content/)
    end

    it 'creates a tab with custom classes for enclosing list item without content block provided' do
      expect(helper.gl_tab_link_to('Link', '/url', { tab_class: 'my-class' })).to match(/<li class=".*my-class.*"/)
    end

    it 'creates a tab with custom classes for enclosing list item with content block provided' do
      expect(helper.gl_tab_link_to('/url', { tab_class: 'my-class' }) { 'Link' }).to match(/<li class=".*my-class.*"/)
    end

    it 'creates a tab with custom classes for anchor element' do
      expect(helper.gl_tab_link_to('Link', '/url', { class: 'my-class' })).to match(/<a class=".*my-class.*"/)
    end

    it 'creates an active tab with item_active = true' do
      expect(helper.gl_tab_link_to('Link', '/url', { item_active: true })).to match(/<a class=".*active gl-tab-nav-item-active gl-tab-nav-item-active-indigo.*"/)
    end

    context 'when on the active page' do
      before do
        allow(helper).to receive(:current_page?).and_return(true)
      end

      it 'creates an active tab' do
        expect(helper.gl_tab_link_to('Link', '/url')).to match(/<a class=".*active gl-tab-nav-item-active gl-tab-nav-item-active-indigo.*"/)
      end

      it 'creates an inactive tab with item_active = false' do
        expect(helper.gl_tab_link_to('Link', '/url', { item_active: false })).not_to match(/<a class=".*active.*"/)
      end
    end
  end

  describe 'nav_link' do
    using RSpec::Parameterized::TableSyntax

    before do
      allow(controller).to receive(:controller_name).and_return('foo')
      allow(helper).to receive(:action_name).and_return('foo')
    end

    context 'with the content of the li' do
      it 'captures block output' do
        expect(helper.nav_link { "Testing Blocks" }).to match(/Testing Blocks/)
      end
    end

    it 'passes extra html options to the list element' do
      expect(helper.nav_link(action: :foo, html_options: { class: 'home' })).to match(/<li class="home active">/)
      expect(helper.nav_link(html_options: { class: 'active' })).to match(/<li class="active">/)
    end

    where(:controller_param, :action_param, :path_param, :active) do
      nil          | nil          | nil                    | false
      :foo         | nil          | nil                    | true
      :bar         | nil          | nil                    | false
      :bar         | :foo         | nil                    | false
      :foo         | :bar         | nil                    | false
      :foo         | :foo         | nil                    | true
      :bar         | nil          | 'foo#foo'              | true
      :bar         | nil          | ['foo#foo', 'bar#bar'] | true
      :bar         | :bar         | ['foo#foo', 'bar#bar'] | true
      :foo         | nil          | 'bar#foo'              | true
      :bar         | nil          | 'bar#foo'              | false
      :foo         | [:foo, :bar] | 'bar#foo'              | true
      :bar         | :bar         | 'foo#foo'              | true
      :foo         | :foo         | 'bar#foo'              | true
      :bar         | :foo         | 'bar#foo'              | false
      :foo         | :bar         | 'bar#foo'              | false
      [:foo, :bar] | nil          | nil                    | true
      [:foo, :bar] | nil          | 'bar#foo'              | true
      [:foo, :bar] | :foo         | 'bar#foo'              | true
      nil          | :foo         | nil                    | true
      nil          | :bar         | nil                    | false
      nil          | nil          | 'foo#bar'              | false
      nil          | nil          | 'foo#foo'              | true
      nil          | :bar         | ['foo#foo', 'bar#bar'] | true
      nil          | :bar         | 'foo#foo'              | true
      nil          | :foo         | 'bar#foo'              | true
      nil          | [:foo, :bar] | nil                    | true
      nil          | [:foo, :bar] | 'bar#foo'              | true
      nil          | :bar         | 'bar#foo'              | false
    end

    with_them do
      specify do
        result = helper.nav_link(controller: controller_param, action: action_param, path: path_param)

        if active
          expect(result).to match(/active/)
        else
          expect(result).not_to match(/active/)
        end
      end
    end

    context 'with namespace in path notation' do
      before do
        allow(controller).to receive(:controller_path).and_return('bar/foo')
      end

      where(:controller_param, :action_param, :path_param, :active) do
        'foo/foo' | nil  | nil           | false
        'bar/foo' | nil  | nil           | true
        'foo/foo' | :foo | nil           | false
        'bar/foo' | :bar | nil           | false
        'bar/foo' | :foo | nil           | true
        nil       | nil  | 'foo/foo#foo' | false
        nil       | nil  | 'bar/foo#foo' | true
      end

      with_them do
        specify do
          result = helper.nav_link(controller: controller_param, action: action_param, path: path_param)

          if active
            expect(result).to match(/active/)
          else
            expect(result).not_to match(/active/)
          end
        end
      end
    end
  end

  describe 'gl_tab_counter_badge' do
    it 'creates a tab counter badge' do
      expect(helper.gl_tab_counter_badge(1)).to eq(
        '<span class="gl-badge badge badge-pill badge-muted sm gl-tab-counter-badge">1</span>'
      )
    end

    context 'with extra classes' do
      it 'creates a tab counter badge with the correct class attribute' do
        expect(helper.gl_tab_counter_badge(1, { class: 'js-test' })).to eq(
          '<span class="gl-badge badge badge-pill badge-muted sm gl-tab-counter-badge js-test">1</span>'
        )
      end
    end

    context 'with data attributes' do
      it 'creates a tab counter badge with the data attributes' do
        expect(helper.gl_tab_counter_badge(1, { data: { some_attribute: 'foo' } })).to eq(
          '<span data-some-attribute="foo" class="gl-badge badge badge-pill badge-muted sm gl-tab-counter-badge">1</span>'
        )
      end
    end
  end
end
