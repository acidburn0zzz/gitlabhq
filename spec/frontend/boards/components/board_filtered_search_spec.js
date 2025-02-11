import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import BoardFilteredSearch from '~/boards/components/board_filtered_search.vue';
import * as urlUtility from '~/lib/utils/url_utility';
import { __ } from '~/locale';
import FilteredSearchBarRoot from '~/vue_shared/components/filtered_search_bar/filtered_search_bar_root.vue';
import AuthorToken from '~/vue_shared/components/filtered_search_bar/tokens/author_token.vue';
import LabelToken from '~/vue_shared/components/filtered_search_bar/tokens/label_token.vue';
import { createStore } from '~/boards/stores';

Vue.use(Vuex);

describe('BoardFilteredSearch', () => {
  let wrapper;
  let store;
  const tokens = [
    {
      icon: 'labels',
      title: __('Label'),
      type: 'label_name',
      operators: [
        { value: '=', description: 'is' },
        { value: '!=', description: 'is not' },
      ],
      token: LabelToken,
      unique: false,
      symbol: '~',
      fetchLabels: () => new Promise(() => {}),
    },
    {
      icon: 'pencil',
      title: __('Author'),
      type: 'author_username',
      operators: [
        { value: '=', description: 'is' },
        { value: '!=', description: 'is not' },
      ],
      symbol: '@',
      token: AuthorToken,
      unique: true,
      fetchAuthors: () => new Promise(() => {}),
    },
  ];

  const createComponent = ({ initialFilterParams = {}, props = {} } = {}) => {
    store = createStore();
    wrapper = shallowMount(BoardFilteredSearch, {
      provide: { initialFilterParams, fullPath: '' },
      store,
      propsData: {
        ...props,
        tokens,
      },
    });
  };

  const findFilteredSearch = () => wrapper.findComponent(FilteredSearchBarRoot);

  afterEach(() => {
    wrapper.destroy();
  });

  describe('default', () => {
    beforeEach(() => {
      createComponent();

      jest.spyOn(store, 'dispatch').mockImplementation();
    });

    it('passes the correct tokens to FilteredSearch', () => {
      expect(findFilteredSearch().props('tokens')).toEqual(tokens);
    });

    describe('when onFilter is emitted', () => {
      it('calls performSearch', () => {
        findFilteredSearch().vm.$emit('onFilter', [{ value: { data: '' } }]);

        expect(store.dispatch).toHaveBeenCalledWith('performSearch');
      });

      it('calls historyPushState', () => {
        jest.spyOn(urlUtility, 'updateHistory');
        findFilteredSearch().vm.$emit('onFilter', [{ value: { data: 'searchQuery' } }]);

        expect(urlUtility.updateHistory).toHaveBeenCalledWith({
          replace: true,
          title: '',
          url: 'http://test.host/',
        });
      });
    });
  });

  describe('when eeFilters is not empty', () => {
    it('passes the correct initialFilterValue to FitleredSearchBarRoot', () => {
      createComponent({ props: { eeFilters: { labelName: ['label'] } } });

      expect(findFilteredSearch().props('initialFilterValue')).toEqual([
        { type: 'label_name', value: { data: 'label', operator: '=' } },
      ]);
    });
  });

  it('renders FilteredSearch', () => {
    createComponent();

    expect(findFilteredSearch().exists()).toBe(true);
  });

  describe('when searching', () => {
    beforeEach(() => {
      createComponent();

      jest.spyOn(wrapper.vm, 'performSearch').mockImplementation();
    });

    it('sets the url params to the correct results', async () => {
      const mockFilters = [
        { type: 'author_username', value: { data: 'root', operator: '=' } },
        { type: 'label_name', value: { data: 'label', operator: '=' } },
        { type: 'label_name', value: { data: 'label2', operator: '=' } },
        { type: 'milestone_title', value: { data: 'New Milestone', operator: '=' } },
        { type: 'types', value: { data: 'INCIDENT', operator: '=' } },
        { type: 'weight', value: { data: '2', operator: '=' } },
        { type: 'iteration', value: { data: '3341', operator: '=' } },
        { type: 'release', value: { data: 'v1.0.0', operator: '=' } },
      ];
      jest.spyOn(urlUtility, 'updateHistory');
      findFilteredSearch().vm.$emit('onFilter', mockFilters);

      expect(urlUtility.updateHistory).toHaveBeenCalledWith({
        title: '',
        replace: true,
        url:
          'http://test.host/?author_username=root&label_name[]=label&label_name[]=label2&milestone_title=New+Milestone&iteration_id=3341&types=INCIDENT&weight=2&release_tag=v1.0.0',
      });
    });
  });

  describe('when url params are already set', () => {
    beforeEach(() => {
      createComponent({ initialFilterParams: { authorUsername: 'root', labelName: ['label'] } });

      jest.spyOn(store, 'dispatch');
    });

    it('passes the correct props to FilterSearchBar', () => {
      expect(findFilteredSearch().props('initialFilterValue')).toEqual([
        { type: 'author_username', value: { data: 'root', operator: '=' } },
        { type: 'label_name', value: { data: 'label', operator: '=' } },
      ]);
    });
  });
});
