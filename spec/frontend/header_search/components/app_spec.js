import { GlSearchBoxByType } from '@gitlab/ui';
import Vue from 'vue';
import Vuex from 'vuex';
import { shallowMountExtended } from 'helpers/vue_test_utils_helper';
import HeaderSearchApp from '~/header_search/components/app.vue';
import HeaderSearchAutocompleteItems from '~/header_search/components/header_search_autocomplete_items.vue';
import HeaderSearchDefaultItems from '~/header_search/components/header_search_default_items.vue';
import HeaderSearchScopedItems from '~/header_search/components/header_search_scoped_items.vue';
import DropdownKeyboardNavigation from '~/vue_shared/components/dropdown_keyboard_navigation.vue';
import { ENTER_KEY } from '~/lib/utils/keys';
import { visitUrl } from '~/lib/utils/url_utility';
import {
  MOCK_SEARCH,
  MOCK_SEARCH_QUERY,
  MOCK_USERNAME,
  MOCK_DEFAULT_SEARCH_OPTIONS,
} from '../mock_data';

Vue.use(Vuex);

jest.mock('~/lib/utils/url_utility', () => ({
  visitUrl: jest.fn(),
}));

describe('HeaderSearchApp', () => {
  let wrapper;

  const actionSpies = {
    setSearch: jest.fn(),
    fetchAutocompleteOptions: jest.fn(),
  };

  const createComponent = (initialState, mockGetters) => {
    const store = new Vuex.Store({
      state: {
        ...initialState,
      },
      actions: actionSpies,
      getters: {
        searchQuery: () => MOCK_SEARCH_QUERY,
        searchOptions: () => MOCK_DEFAULT_SEARCH_OPTIONS,
        ...mockGetters,
      },
    });

    wrapper = shallowMountExtended(HeaderSearchApp, {
      store,
    });
  };

  afterEach(() => {
    wrapper.destroy();
  });

  const findHeaderSearchInput = () => wrapper.findComponent(GlSearchBoxByType);
  const findHeaderSearchDropdown = () => wrapper.findByTestId('header-search-dropdown-menu');
  const findHeaderSearchDefaultItems = () => wrapper.findComponent(HeaderSearchDefaultItems);
  const findHeaderSearchScopedItems = () => wrapper.findComponent(HeaderSearchScopedItems);
  const findHeaderSearchAutocompleteItems = () =>
    wrapper.findComponent(HeaderSearchAutocompleteItems);
  const findDropdownKeyboardNavigation = () => wrapper.findComponent(DropdownKeyboardNavigation);

  describe('template', () => {
    it('always renders Header Search Input', () => {
      createComponent();
      expect(findHeaderSearchInput().exists()).toBe(true);
    });

    describe.each`
      showDropdown | username         | showSearchDropdown
      ${false}     | ${null}          | ${false}
      ${false}     | ${MOCK_USERNAME} | ${false}
      ${true}      | ${null}          | ${false}
      ${true}      | ${MOCK_USERNAME} | ${true}
    `('Header Search Dropdown', ({ showDropdown, username, showSearchDropdown }) => {
      describe(`when showDropdown is ${showDropdown} and current_username is ${username}`, () => {
        beforeEach(() => {
          window.gon.current_username = username;
          createComponent();
          wrapper.setData({ showDropdown });
        });

        it(`should${showSearchDropdown ? '' : ' not'} render`, () => {
          expect(findHeaderSearchDropdown().exists()).toBe(showSearchDropdown);
        });
      });
    });

    describe.each`
      search         | showDefault | showScoped | showAutocomplete | showDropdownNavigation
      ${null}        | ${true}     | ${false}   | ${false}         | ${true}
      ${''}          | ${true}     | ${false}   | ${false}         | ${true}
      ${MOCK_SEARCH} | ${false}    | ${true}    | ${true}          | ${true}
    `(
      'Header Search Dropdown Items',
      ({ search, showDefault, showScoped, showAutocomplete, showDropdownNavigation }) => {
        describe(`when search is ${search}`, () => {
          beforeEach(() => {
            window.gon.current_username = MOCK_USERNAME;
            createComponent({ search });
            findHeaderSearchInput().vm.$emit('click');
          });

          it(`should${showDefault ? '' : ' not'} render the Default Dropdown Items`, () => {
            expect(findHeaderSearchDefaultItems().exists()).toBe(showDefault);
          });

          it(`should${showScoped ? '' : ' not'} render the Scoped Dropdown Items`, () => {
            expect(findHeaderSearchScopedItems().exists()).toBe(showScoped);
          });

          it(`should${
            showAutocomplete ? '' : ' not'
          } render the Autocomplete Dropdown Items`, () => {
            expect(findHeaderSearchAutocompleteItems().exists()).toBe(showAutocomplete);
          });

          it(`should${
            showDropdownNavigation ? '' : ' not'
          } render the Dropdown Navigation Component`, () => {
            expect(findDropdownKeyboardNavigation().exists()).toBe(showDropdownNavigation);
          });
        });
      },
    );
  });

  describe('events', () => {
    beforeEach(() => {
      createComponent();
      window.gon.current_username = MOCK_USERNAME;
    });

    describe('Header Search Input', () => {
      describe('when dropdown is closed', () => {
        it('onFocus opens dropdown', async () => {
          expect(findHeaderSearchDropdown().exists()).toBe(false);
          findHeaderSearchInput().vm.$emit('focus');

          await wrapper.vm.$nextTick();

          expect(findHeaderSearchDropdown().exists()).toBe(true);
        });

        it('onClick opens dropdown', async () => {
          expect(findHeaderSearchDropdown().exists()).toBe(false);
          findHeaderSearchInput().vm.$emit('click');

          await wrapper.vm.$nextTick();

          expect(findHeaderSearchDropdown().exists()).toBe(true);
        });
      });

      describe('onInput', () => {
        beforeEach(() => {
          findHeaderSearchInput().vm.$emit('input', MOCK_SEARCH);
        });

        it('calls setSearch with search term', () => {
          expect(actionSpies.setSearch).toHaveBeenCalledWith(expect.any(Object), MOCK_SEARCH);
        });

        it('calls fetchAutocompleteOptions', () => {
          expect(actionSpies.fetchAutocompleteOptions).toHaveBeenCalled();
        });
      });
    });

    describe('Dropdown Keyboard Navigation', () => {
      beforeEach(() => {
        findHeaderSearchInput().vm.$emit('click');
      });

      it('closes dropdown when @tab is emitted', async () => {
        expect(findHeaderSearchDropdown().exists()).toBe(true);
        findDropdownKeyboardNavigation().vm.$emit('tab');

        await wrapper.vm.$nextTick();

        expect(findHeaderSearchDropdown().exists()).toBe(false);
      });
    });
  });

  describe('computed', () => {
    describe('currentFocusedOption', () => {
      const MOCK_INDEX = 1;

      beforeEach(() => {
        createComponent();
        window.gon.current_username = MOCK_USERNAME;
        findHeaderSearchInput().vm.$emit('click');
      });

      it(`when currentFocusIndex changes to ${MOCK_INDEX} updates the data to searchOptions[${MOCK_INDEX}]`, async () => {
        findDropdownKeyboardNavigation().vm.$emit('change', MOCK_INDEX);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.currentFocusedOption).toBe(MOCK_DEFAULT_SEARCH_OPTIONS[MOCK_INDEX]);
      });
    });
  });

  describe('Submitting a search', () => {
    describe('with no currentFocusedOption', () => {
      beforeEach(() => {
        createComponent();
      });

      it('onKey-enter submits a search', async () => {
        findHeaderSearchInput().vm.$emit('keydown', new KeyboardEvent({ key: ENTER_KEY }));

        await wrapper.vm.$nextTick();

        expect(visitUrl).toHaveBeenCalledWith(MOCK_SEARCH_QUERY);
      });
    });

    describe('with currentFocusedOption', () => {
      const MOCK_INDEX = 1;

      beforeEach(() => {
        createComponent();
        window.gon.current_username = MOCK_USERNAME;
        findHeaderSearchInput().vm.$emit('click');
      });

      it('onKey-enter clicks the selected dropdown item rather than submitting a search', async () => {
        findDropdownKeyboardNavigation().vm.$emit('change', MOCK_INDEX);
        await wrapper.vm.$nextTick();
        findHeaderSearchInput().vm.$emit('keydown', new KeyboardEvent({ key: ENTER_KEY }));
        expect(visitUrl).toHaveBeenCalledWith(MOCK_DEFAULT_SEARCH_OPTIONS[MOCK_INDEX].url);
      });
    });
  });
});
