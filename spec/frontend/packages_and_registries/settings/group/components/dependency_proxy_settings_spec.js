import { GlSprintf, GlToggle } from '@gitlab/ui';
import { createLocalVue } from '@vue/test-utils';
import VueApollo from 'vue-apollo';
import { shallowMountExtended } from 'helpers/vue_test_utils_helper';
import createMockApollo from 'helpers/mock_apollo_helper';
import waitForPromises from 'helpers/wait_for_promises';

import component from '~/packages_and_registries/settings/group/components/dependency_proxy_settings.vue';
import {
  DEPENDENCY_PROXY_HEADER,
  DEPENDENCY_PROXY_SETTINGS_DESCRIPTION,
  DEPENDENCY_PROXY_DOCS_PATH,
} from '~/packages_and_registries/settings/group/constants';

import updateDependencyProxySettings from '~/packages_and_registries/settings/group/graphql/mutations/update_dependency_proxy_settings.mutation.graphql';
import getGroupPackagesSettingsQuery from '~/packages_and_registries/settings/group/graphql/queries/get_group_packages_settings.query.graphql';
import SettingsBlock from '~/vue_shared/components/settings/settings_block.vue';
import { updateGroupDependencyProxySettingsOptimisticResponse } from '~/packages_and_registries/settings/group/graphql/utils/optimistic_responses';
import {
  dependencyProxySettings as dependencyProxySettingsMock,
  dependencyProxySettingMutationMock,
  groupPackageSettingsMock,
  dependencyProxySettingMutationErrorMock,
} from '../mock_data';

jest.mock('~/flash');
jest.mock('~/packages_and_registries/settings/group/graphql/utils/optimistic_responses');

const localVue = createLocalVue();

describe('DependencyProxySettings', () => {
  let wrapper;
  let apolloProvider;

  const defaultProvide = {
    defaultExpanded: false,
    groupPath: 'foo_group_path',
    groupDependencyProxyPath: 'group_dependency_proxy_path',
  };

  localVue.use(VueApollo);

  const mountComponent = ({
    provide = defaultProvide,
    mutationResolver = jest.fn().mockResolvedValue(dependencyProxySettingMutationMock()),
    isLoading = false,
    dependencyProxySettings = dependencyProxySettingsMock(),
  } = {}) => {
    const requestHandlers = [[updateDependencyProxySettings, mutationResolver]];

    apolloProvider = createMockApollo(requestHandlers);

    wrapper = shallowMountExtended(component, {
      localVue,
      apolloProvider,
      provide,
      propsData: {
        dependencyProxySettings,
        isLoading,
      },
      stubs: {
        GlSprintf,
        GlToggle,
        SettingsBlock,
      },
    });
  };

  afterEach(() => {
    wrapper.destroy();
  });

  const findSettingsBlock = () => wrapper.findComponent(SettingsBlock);
  const findDescription = () => wrapper.findByTestId('description');
  const findDescriptionLink = () => wrapper.findByTestId('description-link');
  const findToggle = () => wrapper.findComponent(GlToggle);
  const findToggleHelpLink = () => wrapper.findByTestId('toggle-help-link');

  const fillApolloCache = () => {
    apolloProvider.defaultClient.cache.writeQuery({
      query: getGroupPackagesSettingsQuery,
      variables: {
        fullPath: defaultProvide.groupPath,
      },
      ...groupPackageSettingsMock,
    });
  };

  const emitSettingsUpdate = (value = false) => {
    findToggle().vm.$emit('change', value);
  };

  it('renders a settings block', () => {
    mountComponent();

    expect(findSettingsBlock().exists()).toBe(true);
  });

  it('passes the correct props to settings block', () => {
    mountComponent();

    expect(findSettingsBlock().props('defaultExpanded')).toBe(false);
  });

  it('has the correct header text', () => {
    mountComponent();

    expect(wrapper.text()).toContain(DEPENDENCY_PROXY_HEADER);
  });

  it('has the correct description text', () => {
    mountComponent();

    expect(findDescription().text()).toMatchInterpolatedText(DEPENDENCY_PROXY_SETTINGS_DESCRIPTION);
  });

  it('has the correct link', () => {
    mountComponent();

    expect(findDescriptionLink().attributes()).toMatchObject({
      href: DEPENDENCY_PROXY_DOCS_PATH,
    });
    expect(findDescriptionLink().text()).toBe('Learn more');
  });

  describe('enable toggle', () => {
    it('exists', () => {
      mountComponent();

      expect(findToggle().props()).toMatchObject({
        label: component.i18n.label,
      });
    });

    describe('when enabled', () => {
      beforeEach(() => {
        mountComponent();
      });

      it('has the help prop correctly set', () => {
        expect(findToggle().props()).toMatchObject({
          help: component.i18n.enabledProxyHelpText,
        });
      });

      it('has help text with a link', () => {
        expect(findToggle().text()).toContain(
          'To see the image prefix and what is in the cache, visit the Dependency Proxy',
        );
        expect(findToggleHelpLink().attributes()).toMatchObject({
          href: defaultProvide.groupDependencyProxyPath,
        });
      });
    });

    describe('when disabled', () => {
      beforeEach(() => {
        mountComponent({
          dependencyProxySettings: dependencyProxySettingsMock({ enabled: false }),
        });
      });

      it('has the help prop set to empty', () => {
        expect(findToggle().props()).toMatchObject({
          help: '',
        });
      });

      it('the help text is not visible', () => {
        expect(findToggleHelpLink().exists()).toBe(false);
      });
    });
  });

  describe('settings update', () => {
    describe('success state', () => {
      it('emits a success event', async () => {
        mountComponent();

        fillApolloCache();
        emitSettingsUpdate();

        await waitForPromises();

        expect(wrapper.emitted('success')).toEqual([[]]);
      });

      it('has an optimistic response', () => {
        mountComponent();

        fillApolloCache();

        expect(findToggle().props('value')).toBe(true);

        emitSettingsUpdate();

        expect(updateGroupDependencyProxySettingsOptimisticResponse).toHaveBeenCalledWith({
          enabled: false,
        });
      });
    });

    describe('errors', () => {
      it('mutation payload with root level errors', async () => {
        const mutationResolver = jest
          .fn()
          .mockResolvedValue(dependencyProxySettingMutationErrorMock);
        mountComponent({ mutationResolver });

        fillApolloCache();

        emitSettingsUpdate();

        await waitForPromises();

        expect(wrapper.emitted('error')).toEqual([[]]);
      });

      it.each`
        type         | mutationResolver
        ${'local'}   | ${jest.fn().mockResolvedValue(dependencyProxySettingMutationMock({ errors: ['foo'] }))}
        ${'network'} | ${jest.fn().mockRejectedValue()}
      `('mutation payload with $type error', async ({ mutationResolver }) => {
        mountComponent({ mutationResolver });

        fillApolloCache();
        emitSettingsUpdate();

        await waitForPromises();

        expect(wrapper.emitted('error')).toEqual([[]]);
      });
    });
  });

  describe('when isLoading is true', () => {
    it('disables enable toggle', () => {
      mountComponent({ isLoading: true });

      expect(findToggle().props('disabled')).toBe(true);
    });
  });
});
