/// <reference path="osgiHelpers.ts"/>
/// <reference path="osgiPlugin.ts"/>

namespace Osgi {
  
  _module.controller("Osgi.FrameworkController", ["$scope", "workspace", "$q", (
      $scope,
      workspace: Jmx.Workspace,
      $q: ng.IQService) => {

    $scope.frameworkMBean = null;
    let showNotification: boolean;

    $scope.save = function() {
      if (parseInt($scope.config.startLevel) < parseInt($scope.config.initialBundleStartLevel)) {
        Core.notification("danger", "Can't set Framework Start Level below Initial Bundle Start Level");
      } else {
        var mbean = getSelectionFrameworkMBean(workspace);
        if (mbean) {
          showNotification = true;
          workspace.jolokia.request([
            { type: 'write', mbean: mbean, attribute: 'FrameworkStartLevel', value: $scope.config.startLevel },
            { type: 'write', mbean: mbean, attribute: 'InitialBundleStartLevel', value: $scope.config.initialBundleStartLevel }
          ], {
            error: response => {
              if (showNotification) {
                Core.notification("danger", response.error);
                showNotification = false;
              }
            },
            success: response => {
              if (showNotification) {
                Core.notification("success", "Configuration updated");
                showNotification = false;
              }
            }
          });
        }
      }
    }

    function updateContents() {
      getSelectionFrameworkMBeanAsync(workspace, $q)
        .then(mbean => {
          if (mbean) {
            $scope.frameworkMBean = mbean;
            var jolokia = workspace.jolokia;
            jolokia.request(
              { type: 'read', mbean: mbean },
              { success: response => {
                  $scope.config = {
                    startLevel: response.value.FrameworkStartLevel,
                    initialBundleStartLevel: response.value.InitialBundleStartLevel
                  }
                  Core.$apply($scope);
                }
              });
          }
        });
    }

    updateContents();

  }]);
}
