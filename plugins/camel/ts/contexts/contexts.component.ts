/// <reference path="context.ts"/>
/// <reference path="contexts.service.ts"/>

namespace Camel {

  export class ContextsController {

    private startAction = {
      name: 'Start',
      actionFn: action => {
        let selectedContexts = this.getSelectedContexts();
        this.contextsService.startContexts(selectedContexts)
          .then(response => this.updateContexts());
      },
      isDisabled: true
    };
    private suspendAction = {
      name: 'Suspend',
      actionFn: action => {
        let selectedContexts = this.getSelectedContexts();
        this.contextsService.suspendContexts(selectedContexts)
          .then(response => this.updateContexts());
      },
      isDisabled: true
    }
    private deleteAction = {
      name: 'Delete',
      actionFn: action => {
        this.$uibModal.open({
          templateUrl: 'plugins/camel/html/deleteContextModal.html'
        })
        .result.then(() => {
          let selectedContexts = this.getSelectedContexts();
          this.contextsService.stopContexts(selectedContexts)
            .then(response => this.removeSelectedContexts());
        });
      },
      isDisabled: true
    };

    toolbarConfig = {
      actionsConfig: {
        primaryActions: [
          this.startAction,
          this.suspendAction
        ],
        moreActions: [
          this.deleteAction
        ]
      },
      isTableView: true
    };

    tableConfig = {
      selectionMatchProp: "name",
      onCheckBoxChange: item => this.enableDisableActions()
    };

    tableColumns = [
      { header: "Name", itemField: "name" },
      { header: "State", itemField: "state" }
    ];

    contexts: Context[];

    constructor(private $uibModal, private workspace: Jmx.Workspace, private contextsService: ContextsService) {
      'ngInject';
    }

    $onInit() {
      this.contextsService.getContexts()
        .then(contexts => this.contexts = contexts);
    }

    private getSelectedContexts(): Context[] {
      return this.contexts.filter(context => context.selected);
    }

    private enableDisableActions() {
      let selectedContexts = this.getSelectedContexts();
      this.startAction.isDisabled = !selectedContexts.some(context => context.state === 'Suspended');
      this.suspendAction.isDisabled = !selectedContexts.some(context => context.state === 'Started');
      this.deleteAction.isDisabled = selectedContexts.length === 0;
    }

    private updateContexts() {
      this.contextsService.getContexts()
        .then(contexts => {
          for (let i = 0; i < contexts.length; i++) {
            if (this.contexts[i].state !== contexts[i].state) {
              this.contexts[i] = angular.extend({}, this.contexts[i], {state: contexts[i].state});
            }
          }
          this.enableDisableActions();
        });
    }

    private removeSelectedContexts() {
      _.remove(this.contexts, context => context.selected);
      this.workspace.loadTree();
      this.enableDisableActions();
    }
  }

  export const contextsComponent = <angular.IComponentOptions>{
    template: `
      <h2>Contexts</h2>
      <p ng-if="!$ctrl.contexts">Loading...</p>
      <div ng-if="$ctrl.contexts">
        <pf-toolbar config="$ctrl.toolbarConfig"></pf-toolbar>
        <pf-table-view config="$ctrl.tableConfig" columns="$ctrl.tableColumns" items="$ctrl.contexts"></pf-table-view>
      </div>
    `,
    controller: ContextsController
  };

}
