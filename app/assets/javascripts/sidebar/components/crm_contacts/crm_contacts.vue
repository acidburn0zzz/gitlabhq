<script>
import { GlIcon, GlPopover, GlTooltipDirective } from '@gitlab/ui';
import { __, n__, sprintf } from '~/locale';
import createFlash from '~/flash';
import { convertToGraphQLId } from '~/graphql_shared/utils';
import { TYPE_ISSUE } from '~/graphql_shared/constants';
import getIssueCrmContactsQuery from './queries/get_issue_crm_contacts.query.graphql';
import issueCrmContactsSubscription from './queries/issue_crm_contacts.subscription.graphql';

export default {
  components: {
    GlIcon,
    GlPopover,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  props: {
    issueId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      contacts: [],
    };
  },
  apollo: {
    contacts: {
      query: getIssueCrmContactsQuery,
      variables() {
        return this.queryVariables;
      },
      update(data) {
        return data?.issue?.customerRelationsContacts?.nodes;
      },
      error(error) {
        createFlash({
          message: __('Something went wrong trying to load issue contacts.'),
          error,
          captureError: true,
        });
      },
      subscribeToMore: {
        document: issueCrmContactsSubscription,
        variables() {
          return this.queryVariables;
        },
        updateQuery(prev, { subscriptionData }) {
          const draftData = subscriptionData?.data?.issueCrmContactsUpdated;
          if (prev && draftData) return { issue: draftData };
          return prev;
        },
      },
    },
  },
  computed: {
    shouldShowContacts() {
      return this.contacts?.length;
    },
    queryVariables() {
      return { id: convertToGraphQLId(TYPE_ISSUE, this.issueId) };
    },
    contactsLabel() {
      return sprintf(n__('%{count} contact', '%{count} contacts', this.contactCount), {
        count: this.contactCount,
      });
    },
    contactCount() {
      return this.contacts?.length || 0;
    },
  },
  methods: {
    shouldShowPopover(contact) {
      return this.popOverData(contact).length > 0;
    },
    divider(index) {
      if (index < this.contactCount - 1) return ',';
      return '';
    },
    popOverData(contact) {
      return [contact.organization?.name, contact.email, contact.phone, contact.description].filter(
        Boolean,
      );
    },
  },
  i18n: {
    help: __('Work in progress- click here to find out more'),
  },
};
</script>

<template>
  <div>
    <div v-gl-tooltip.left.viewport :title="contactsLabel" class="sidebar-collapsed-icon">
      <gl-icon name="users" />
      <span> {{ contactCount }} </span>
    </div>
    <div
      v-gl-tooltip.left.viewport="$options.i18n.help"
      class="hide-collapsed help-button float-right"
    >
      <a href="https://gitlab.com/gitlab-org/gitlab/-/issues/2256"><gl-icon name="question-o" /></a>
    </div>
    <div class="title hide-collapsed gl-mb-2 gl-line-height-20">
      {{ contactsLabel }}
    </div>
    <div class="hide-collapsed gl-display-flex gl-flex-wrap">
      <div
        v-for="(contact, index) in contacts"
        :id="`contact_container_${index}`"
        :key="index"
        class="gl-pr-2"
      >
        <span :id="`contact_${index}`" class="gl-font-weight-bold"
          >{{ contact.firstName }} {{ contact.lastName }}{{ divider(index) }}</span
        >
        <gl-popover
          v-if="shouldShowPopover(contact)"
          :target="`contact_${index}`"
          :container="`contact_container_${index}`"
          triggers="hover focus"
          placement="top"
        >
          <div v-for="row in popOverData(contact)" :key="row">{{ row }}</div>
        </gl-popover>
      </div>
    </div>
  </div>
</template>
