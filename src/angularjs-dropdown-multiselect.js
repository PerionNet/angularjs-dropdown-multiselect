'use strict';

var directiveModule = angular.module('angularjs-dropdown-multiselect', []);

directiveModule.directive('ngDropdownMultiselect', ['$filter', '$document', '$compile', '$parse', 'focus',
    function ($filter, $document, $compile, $parse, focus) {

        return {
            restrict: 'AE',
            scope: {
                selectedModel: '=',
                options: '=',
                extraSettings: '=',
                events: '=',
                searchFilter: '=?',
                translationTexts: '=',
                groupBy: '@',
                api: '=',
                isCustomDateOpen: '=',
                open: '='
            },
            template: function (element, attrs) {
                var checkboxes = attrs.checkboxes ? true : false;
                var customdate = attrs.customdate ? true : false;
                var groups = attrs.groupBy ? true : false;

                var template = '<div class="multiselect-parent btn-group dropdown-multiselect" arrow-selector>';
                template += '<button id="{{elementId}}_btn" type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
                template += '<ul id="{{elementId}}-multiselect-wrapper" class="dropdown-menu dropdown-menu-form" ng-if="open" ng-style="{height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll; display: block;" ';
                template += 'infinite-scroll="addMoreItems()" ';
                template += 'infinite-scroll-container="getInfiniteScrollContainer()" ';
                template += 'infinite-scroll-distance="1" ';
                template += 'infinite-scroll-immediate-check="false" >';
                template += '<li ng-show="settings.enableSearch" class="dropdown-search-holder"><div class="dropdown-header"><input ng-change="clearSelectedRow()" id="{{elementId}}_search" type="text" class="form-control search-filter" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" focus-on="focusInput"/></li>';
                template += '<li ng-show="settings.enableSearch" class="divider"></li>';
                template += '<li ng-show="settings.enableEmpty"></li>';
                template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll(); checkedAll = true" id="{{elementId}}_checkAll"><span ng-class="{\'checkbox-ok\': isCheckedAll()}" class="checkbox"></span>{{texts.checkAll}}</a>';
                template += '<li ng-show="settings.showUncheckAll" class="uncheckAll-separator"><a data-ng-click="deselectAll(); checkedAll = false" id="{{elementId}}_uncheckAll"><span class="checkbox uncheck-all"></span>{{texts.uncheckAll}}</a></li>';

                template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
                template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
                template += '<li role="presentation" ng-show="settings.selectionLimit > 1" class="selection-indicator"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

                if (groups) {
                    //template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter"  ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)"  class="multiselector-group-title">';//{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}';
                    //template += '<a  role="presentation" tabindex="-1" ng-click="selectOrdeselectAll(getPropertyForObject(option,settings.groupBy), !isCheckedGroup(getPropertyForObject(option,settings.groupBy)))" tooltip="{{getPropertyForObject(option, settings.displayProp)}}">';
                    //template += '<span data-ng-class="{\'glyphicon glyphicon-ok\': isCheckedGroup(getPropertyForObject(option,settings.groupBy))}"></span> {{getGroupTitle(getPropertyForObject(option, settings.groupBy)) | limitTo:settings.tooltipNumLimit}}</a> <a ng-click="groupOpen(getPropertyForObject(option,settings.groupBy))"><i class="hf hf-arrow-down"></i></a>';

                    //template += '<li ng-repeat-end role="presentation">';

                    template += '<li ng-repeat="option in orderedItems | filter: searchFilter" class="multiselector-group-title" ng-if="getPropertyForObject(orderedItems[$index], settings.groupBy) !== getPropertyForObject(orderedItems[$index-1], settings.groupBy)">';
                    template += '<a  role="presentation" tabindex="-1" ng-click="selectOrdeselectAll(getPropertyForObject(option,settings.groupBy), !isCheckedGroup(getPropertyForObject(option,settings.groupBy)))"">';
                    template += '<span data-ng-class="{\'checkbox-ok\': isCheckedGroup(getPropertyForObject(option,settings.groupBy)), \'checkbox-minus\': isCheckedGroupPart(getPropertyForObject(option,settings.groupBy))}" class="checkbox"></span>';
                    template += ' {{getGroupTitle(getPropertyForObject(option, settings.groupBy)) | limitTo:settings.tooltipNumLimit}}</a> <i class="group-arrow" ng-class="{\'arrow-opened\': openGroup}" ng-click="openGroup = !openGroup"></i>';
                    template += '<ul class="group-list" ng-class="openGroup ? \'group-open\' : \'\'">';
                    template += '<li class="multiselect-checkers"><a data-ng-click="selectAllInGroup(getPropertyForObject(option,settings.groupBy), !isCheckedGroup(getPropertyForObject(option,settings.groupBy)))" id="{{elementId}}_checkAll"><span ng-class="{\'checkbox-ok\': checkedAll}" class="checkbox"></span>{{texts.checkAll}}</a>';
                    template += '<li class="multiselect-checkers"><a data-ng-click="deselectAllInGroup(getPropertyForObject(option,settings.groupBy), !isCheckedGroup(getPropertyForObject(option,settings.groupBy)))" id="{{elementId}}_uncheckAll"><span class="checkbox uncheck-all"></span>{{texts.uncheckAll}}</a></li>';
                    template += '<li role="presentation" ng-repeat="option in options | filter: option.browser">';
                    template += '<a id="{{elementId}}_option{{option.id}}" role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))" tooltip="{{getPropertyForObject(option, settings.displayProp)}}"  ng-class="(getPropertyForObject(option, settings.displayProp).length > settings.tooltipNumLimit) ? \'shorten\' : \'\'" tooltip-enable="getPropertyForObject(option, settings.displayProp).length > settings.tooltipNumLimit">';
                    template += '<span data-ng-class="{\'checkbox-ok\': isChecked(getPropertyForObject(option,settings.idProp))}" class="checkbox"></span>{{option.name}}</a>';
                    template += '</li></ul>';
                    template += '</li>';

                } else {
                    template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter | limitTo: itemsDisplayedInList track by $index " ng-class="{\'dropdown-multiselect-selected\':$index == selectedRow}">';

                    template += '<a id="{{elementId}}_option{{option.id}}" role="menuitem" href="javascript:void(0)" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))" tooltip="{{getPropertyForObject(option, settings.displayProp)}}"  ng-class="(getPropertyForObject(option, settings.displayProp).length > settings.tooltipNumLimit) ? \'shorten\' : \'\'" tooltip-enable="getPropertyForObject(option, settings.displayProp).length > settings.tooltipNumLimit">';

                    if (checkboxes) {
                        template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
                    } else {
                        template += '<span data-ng-class="{\'checkbox-ok\': isChecked(getPropertyForObject(option,settings.idProp))}" class="checkbox"></span> {{getPropertyForObject(option, settings.displayProp) | limitTo:settings.tooltipNumLimit}}</a>';
                    }

                    template += '</li>';
                }

                template += '</ul>';
                template += '</div>';

                /*if (customdate) {
                 template += '<div class="filter-custom-dates ng-hide" ng-show="isCustomDateOpen">';
                 template += '<button class="date-picker-close" ng-click="isCustomDateOpen = !isCustomDateOpen"></button>';
                 template += '<datepicker ng-model="datePickerStart" show-weeks="false" class="date-picker-wrapper start-date"></datepicker>';
                 template += '<datepicker ng-model="datePickerEnd" show-weeks="false" class="date-picker-wrapper end-date"></datepicker>';
                 template += '</div>';
                 }*/

                element.html(template);
            },
            link: function ($scope, $element, $attrs) {
                $scope.elementId = $attrs.id;
                $scope.selectedRow = -1;
                var watchOptions;
                var watchTranslationTexts;
                var watchExtraSettings;

                var $dropdownTrigger = $element.children()[0];

                $scope.toggleDropdown = function () {
                    $scope.open = !$scope.open;
                    if ($scope.open) {
                        focus('focusInput');
                    }
                };

                $scope.checkboxClick = function ($event, id) {
                    $scope.setSelectedItem(id);
                    $event.stopImmediatePropagation();
                };

                $scope.externalEvents = {
                    onItemSelect: angular.noop,
                    onItemDeselect: angular.noop,
                    onSelectAll: angular.noop,
                    onDeselectAll: angular.noop,
                    onInitDone: angular.noop,
                    onMaxSelectionReached: angular.noop
                };

                $scope.settings = {
                    dynamicTitle: true,
                    scrollable: false,
                    scrollableHeight: '300px',
                    closeOnBlur: true,
                    displayProp: 'label',
                    idProp: 'id',
                    externalIdProp: 'id',
                    enableSearch: false,
                    selectionLimit: 0,
                    showCheckAll: true,
                    showUncheckAll: true,
                    closeOnSelect: false,
                    buttonClasses: 'btn btn-default',
                    closeOnDeselect: false,
                    groupBy: $attrs.groupBy || undefined,
                    groupByTextProvider: null,
                    allowGroupSelect: true,
                    smartButtonMaxItems: 0,
                    smartButtonTextConverter: angular.noop,
                    tooltipNumLimit: 30,
                    enableEmpty: false
                };

                $scope.texts = {
                    checkAll: 'Check All',
                    uncheckAll: 'Uncheck All',
                    selectionCount: 'checked',
                    selectionOf: '/',
                    searchPlaceholder: 'Search...',
                    buttonDefaultText: 'Select',
                    dynamicButtonTextSuffix: 'checked',
                    buttonAllDefaultText: null,
                    buttonCustomDateText: null
                };

                $scope.searchFilter = $scope.searchFilter || '';
                $scope.itemsDisplayedInList = 20;

                $scope.clearSelectedRow = function (val) {
                    $scope.selectedRow = -1;
                };

                if (angular.isDefined($scope.settings.groupBy)) {
                    watchOptions = $scope.$watch('options', function (newValue) {
                        if (angular.isDefined(newValue)) {
                            $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                        }
                    });
                }

                angular.extend($scope.settings, $scope.extraSettings || []);
                angular.extend($scope.externalEvents, $scope.events || []);
                angular.extend($scope.texts, $scope.translationTexts);

                watchTranslationTexts = $scope.$watch('translationTexts', function (translationTexts) {
                    angular.extend($scope.texts, translationTexts);
                });

                watchExtraSettings = $scope.$watch('extraSettings', function (extraSettings) {
                    angular.extend($scope.settings, extraSettings);
                });

                $scope.singleSelection = $scope.settings.selectionLimit === 1;

                function getFindObj (id) {
                    var findObj = {};

                    if ($scope.settings.externalIdProp === '') {
                        findObj[$scope.settings.idProp] = id;
                    } else {
                        findObj[$scope.settings.externalIdProp] = id;
                    }

                    return findObj;
                }

                function clearObject (object) {
                    for (var prop in object) {
                        delete object[prop];
                    }
                }

                if ($scope.singleSelection) {
                    if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                        clearObject($scope.selectedModel);
                    }
                }

                $scope.clickHandler = function (e) {
                    var target = e.target.parentElement;
                    var parentFound = false;

                    while (angular.isDefined(target) && target !== null && !parentFound) {
                        if (typeof(target.className) === 'string' && _.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                            if (target === $dropdownTrigger) {
                                parentFound = true;
                            }
                        }
                        target = target.parentElement;
                    }

                    if (!parentFound) {
                        $scope.$apply(function () {
                            $scope.open = false;
                        });
                    }
                };


                if ($scope.settings.closeOnBlur) {
                    $document.on('click.ngDropdownMultiselect', $scope.clickHandler);
                }

                $scope.getGroupTitle = function (groupValue) {
                    if ($scope.settings.groupByTextProvider !== null) {
                        return $scope.settings.groupByTextProvider(groupValue);
                    }

                    return groupValue;
                };

                $scope.getButtonText = function () {
                    if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {

                        if ($scope.settings.smartButtonMaxItems > 0) {
                            var itemsText = [];

                            if (($scope.options.length === $scope.selectedModel.length) && ($scope.texts.buttonAllDefaultText)) {
                                return $scope.texts.buttonAllDefaultText;
                            }
                            if ($scope.options[$scope.selectedModel.id] && $scope.options[$scope.selectedModel.id].value === "custom") {
                                return $scope.texts.buttonCustomDateText;
                            }

                            angular.forEach($scope.options, function (optionItem) {
                                if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                                    var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                                    var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                                    itemsText.push(converterResponse ? converterResponse : displayText);
                                }
                            });

                            if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                                itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                                itemsText.push('...');
                            }

                            return itemsText.join(', ');
                        } else {
                            var totalSelected;

                            if ($scope.singleSelection) {
                                totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                            } else {
                                totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                            }
                            if (totalSelected === 0) {
                                return $scope.texts.buttonDefaultText;
                            }
                            else {
                                return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                            }
                        }
                    } else {
                        return $scope.texts.buttonDefaultText;
                    }
                };

                $scope.getPropertyForObject = function (object, property) {
                    if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                        return object[property];
                    }

                    return '';
                };

                $scope.selectAll = function (inGroup) {
                    $scope.deselectAll(false);
                    $scope.externalEvents.onSelectAll();

                    angular.forEach($scope.options, function (value) {
                        $scope.setSelectedItem(value[$scope.settings.idProp], true);
                    });
                };

                $scope.deselectAll = function (sendEvent) {
                    sendEvent = sendEvent || true;

                    if (sendEvent) {
                        $scope.externalEvents.onDeselectAll();
                    }

                    if ($scope.singleSelection) {
                        clearObject($scope.selectedModel);
                    } else {
                        $scope.selectedModel.splice(0, $scope.selectedModel.length);
                    }
                };

                $scope.selectOrdeselectAll = function (inGroup, dontRemove) {

                    angular.forEach($scope.options, function (value) {
                        //$scope.setSelectedItem(value[$scope.settings.idProp], true);
                        if (!inGroup || value[$scope.settings.groupBy] === inGroup) {
                            $scope.setSelectedItem(value[$scope.settings.idProp], dontRemove);
                        }
                    });
                };

                $scope.selectAllInGroup = function (inGroup, dontRemove) {

                    $scope.orderedItems.forEach(function (item) {
                        if (item[$scope.groupBy] === inGroup) {
                            $scope.setSelectedItem(item[$scope.settings.idProp], true);
                        }
                    });

                };

                $scope.deselectAllInGroup = function (inGroup, dontRemove) {

                    $scope.orderedItems.forEach(function (item) {
                        if (item[$scope.groupBy] === inGroup) {
                            var index = $scope.selectedModel.indexOf(item);
                            if (index > -1) {
                                $scope.selectedModel.splice(index, 1);
                            }
                            //$scope.setSelectedItem(item[$scope.settings.idProp], false);
                        }
                    });

                };

                $scope.setSelectedItem = function (id, dontRemove) {
                    var findObj = getFindObj(id);
                    var finalObj = null;

                    if ($scope.settings.externalIdProp === '') {
                        finalObj = _.find($scope.options, findObj);
                    } else {
                        finalObj = findObj;
                    }

                    if ($scope.singleSelection) {
                        clearObject($scope.selectedModel);
                        angular.extend($scope.selectedModel, finalObj);
                        $scope.externalEvents.onItemSelect(finalObj);
                        if ($scope.settings.closeOnSelect) $scope.open = false;

                        /*if($scope.options[findObj.id].value === "custom") {
                         $scope.open = true;
                         }*/

                        return;
                    }

                    dontRemove = dontRemove || false;

                    var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

                    if (!dontRemove && exists) {
                        $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                        $scope.externalEvents.onItemDeselect(findObj);
                    } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                        $scope.selectedModel.push(finalObj);
                        $scope.externalEvents.onItemSelect(finalObj);
                    }
                    if ($scope.settings.closeOnSelect) $scope.open = false;
                };


                $scope.isChecked = function (id) {
                    if ($scope.singleSelection) {
                        return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(id)[$scope.settings.idProp];
                    }

                    return _.findIndex($scope.selectedModel, getFindObj(id)) !== -1;
                };

                $scope.isCheckedAll = function () {
                    var length = 0;
                    length = $scope.orderedItems ? $scope.orderedItems.length : $scope.options.length;
                    return ($scope.selectedModel.length === length)
                };

                $scope.isCheckedGroup = function (groupName) {
                    if ($scope.selectedModel.length >= 1) {
                        var groupTotal = 0;
                        var selectedGroupTotal = 0;

                        $scope.orderedItems.forEach(function (item) {
                            if (item[$scope.groupBy] === groupName) {
                                groupTotal++;
                            }
                        });

                        $scope.selectedModel.forEach(function (item) {
                            if (item[$scope.groupBy] === groupName) {
                                selectedGroupTotal++;
                            }
                        });
                        return (selectedGroupTotal === groupTotal)
                    }
                    else {
                        return false;
                    }
                };
                $scope.isCheckedGroupPart = function (groupName) {
                    if ($scope.selectedModel.length >= 1) {
                        var groupTotal = 0;
                        var selectedGroupTotal = 0;

                        $scope.orderedItems.forEach(function (item) {
                            if (item[$scope.groupBy] === groupName) {
                                groupTotal++;
                            }
                        });

                        $scope.selectedModel.forEach(function (item) {
                            if (item[$scope.groupBy] === groupName) {
                                selectedGroupTotal++;
                            }
                        });
                        return (selectedGroupTotal < groupTotal && selectedGroupTotal > 0)
                    }
                    else {
                        return false;
                    }
                };


                if ($scope.api) {
                    $scope.api.toggleDropdown = function () {
                        $scope.toggleDropdown();
                    };
                }

                $scope.addMoreItems = function () {
                    $scope.itemsDisplayedInList += 1;
                };

                $scope.getInfiniteScrollContainer = function () {
                    return '#' + $scope.elementId + '-multiselect-wrapper';
                };

                $scope.clickedRow = function (index) {
                    $scope.setSelectedItem($scope.getPropertyForObject($scope.options[index], $scope.settings.idProp))
                }


                $scope.$on("$destroy", function () {
                    $dropdownTrigger = null;
                    $document.off('click.ngDropdownMultiselect', $scope.clickHandler);
                    if (watchOptions) watchOptions();
                    if (watchTranslationTexts) watchTranslationTexts();
                    if (watchExtraSettings) watchExtraSettings();
                });

                $scope.externalEvents.onInitDone();
            }
        };

    }]);

directiveModule.directive('arrowSelector', ['$document', function ($document) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            var elemFocus = false;
            scope.mouseenterHandler = function () {
                elemFocus = true;
            };
            scope.mouseleaveHandler = function () {
                elemFocus = false;
                scope.selectedRow = -1;
            };
            scope.keydownHandler = function (e) {
                if (elemFocus) {
                    if (e.keyCode == 38) {
                        if (scope.selectedRow == 0) {
                            return;
                        }
                        scope.selectedRow--;
                        scope.$apply();
                        e.preventDefault();
                    } else if (e.keyCode == 40) {
                        if (scope.selectedRow == scope.options.length - 1) {
                            return;
                        }
                        scope.selectedRow++;
                        scope.$apply();
                        e.preventDefault();
                    } else if (e.keyCode == 13) {
                        if (scope.selectedRow > -1) {
                            scope.clickedRow(scope.selectedRow);
                            scope.$apply();
                            e.preventDefault();
                        }
                    }
                }
            };

            elem.on('mouseenter.ngDropdownMultiselect', scope.mouseenterHandler);
            elem.on('mouseleave.ngDropdownMultiselect', scope.mouseleaveHandler);
            $document.bind('keydown.ngDropdownMultiselect', scope.keydownHandler);

            scope.$on("$destroy", function () {
                elem.off('mouseenter.ngDropdownMultiselect', scope.mouseenterHandler);
                elem.off('mouseleave.ngDropdownMultiselect', scope.mouseleaveHandler);
                $document.off('keydown.ngDropdownMultiselect', scope.keydownHandler);
            });
        }
    };
}]);
