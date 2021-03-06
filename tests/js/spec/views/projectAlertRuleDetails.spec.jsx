import React from 'react';
import {mount} from 'enzyme';
import {browserHistory} from 'react-router';

import ProjectAlertRuleDetails from 'app/views/projectAlertRuleDetails';

jest.mock('jquery');

describe('ProjectAlertRuleDetails', function() {
  beforeEach(function() {
    browserHistory.replace = jest.fn();
    MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/rules/configuration/',
      method: 'GET',
      body: TestStubs.ProjectAlertRuleConfiguration(),
    });
    MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/rules/1/',
      method: 'GET',
      body: TestStubs.ProjectAlertRule(),
    });
  });

  afterEach(function() {
    MockApiClient.clearMockResponses();
  });

  describe('New alert rule', function() {
    let wrapper, mock;
    beforeEach(function() {
      mock = MockApiClient.addMockResponse({
        url: '/projects/org-slug/project-slug/rules/',
        method: 'POST',
        body: TestStubs.ProjectAlertRule(),
      });

      wrapper = mount(
        <ProjectAlertRuleDetails
          params={{orgId: 'org-slug', projectId: 'project-slug'}}
        />,
        {
          context: {
            project: TestStubs.Project(),
            organization: TestStubs.Organization(),
          },
        }
      );
    });
    it('renders', function() {
      expect(wrapper).toMatchSnapshot();
    });

    it('sets defaults', function() {
      let selects = wrapper.find('Select2Field');
      expect(selects.first().props().value).toBe('all');
      expect(selects.last().props().value).toBe(30);
    });

    describe('saves', function() {
      let name;
      beforeEach(function() {
        name = wrapper.find('input').first();
        name.simulate('change', {target: {value: 'My rule'}});

        wrapper.find('form').simulate('submit');
      });

      it('sends create request on save', function() {
        expect(mock).toHaveBeenCalled();

        expect(mock.mock.calls[0][1]).toMatchObject({
          data: {
            name: 'My rule',
          },
        });
      });

      it('updates URL', function() {
        let url = '/org-slug/project-slug/settings/alerts/rules/1/';
        expect(browserHistory.replace).toHaveBeenCalledWith(url);
      });
    });
  });

  describe('Edit alert rule', function() {
    let wrapper, mock;
    beforeEach(function() {
      mock = MockApiClient.addMockResponse({
        url: '/projects/org-slug/project-slug/rules/1/',
        method: 'PUT',
        body: TestStubs.ProjectAlertRule(),
      });

      wrapper = mount(
        <ProjectAlertRuleDetails
          params={{orgId: 'org-slug', projectId: 'project-slug', ruleId: '1'}}
        />,
        {
          context: {
            project: TestStubs.Project(),
            organization: TestStubs.Organization(),
          },
        }
      );
    });
    it('renders', function() {
      expect(wrapper).toMatchSnapshot();
    });

    it('updates', function() {
      const name = wrapper.find('input').first();
      name.simulate('change', {target: {value: 'My rule'}});

      wrapper.find('form').simulate('submit');
      expect(mock).toHaveBeenCalled();
    });

    it('does not update URL', function() {
      expect(browserHistory.replace).not.toHaveBeenCalled();
    });
  });
});
