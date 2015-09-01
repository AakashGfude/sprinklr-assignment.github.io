var user = angular.module('user', ['ui.bootstrap']);
user.controller('MainController', ['$scope', 'tableData',
    function($scope, tableData) {
        $scope.tableNo = tableData.getLength();
        $scope.getData = tableData.getData();
        $scope.setData = tableData.setData();
        //$scope.employee = {};
        $scope.names = (function() {
            var arr = [];
            for (var i in $scope.getData) {
                for (var j in $scope.getData[i]) {
                    if ($scope.getData[i][j]['name'] && arr.indexOf($scope.getData[i][j]['name']) === -1) {
                        arr.push($scope.getData[i][j]['name']);
                    }
                }
            }
            return arr;
        }());
        $scope.emailData = {};
        $scope.emailData.emailName = '';
        $scope.emailData.emailInitialTable = '';
        $scope.emailData.emailFinalTable = '';
        $scope.flags ={};
        $scope.flags.teamFlag = 0;
        $scope.flags.jobsFlag = 0;
        $scope.origin ={};
        $scope.origin.ParentKey = 0;
        $scope.origin.ChildKey = 0;
        $scope.origin.element = 0;
        $scope.$on('serviceChanged', function() {
            $scope.$apply(function() {
                $scope.getData = tableData.getData();
            });
        });
        $scope.$watchCollection('teams', function(value) {
            var filterOn = 0;
            $scope.flags.teamFlag = false;
            for (var i in value) {
                if (value[i] === true) {
                    filterOn++;
                    $scope.$broadcast('teamSelected', i);
                    //$scope.flags.teamFlag = true;
                }
            }
            if( filterOn == 2){
                $scope.flags.teamFlag = true;
            }
        });
        $scope.$watchCollection('jobs', function(value) {
            var filterOn = 0;
            $scope.flags.jobsFlag = false;
            for (var i in value) {
                if (value[i] === true) {
                    filterOn++;
                    $scope.$broadcast('jobSelected', i);
                    //$scope.flags.jobsFlag = true;
                }
            }
             if( filterOn == 2){
                $scope.flags.jobsFlag = true;
            }
        })
    }
]);
user.directive('autoComplete', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            scope.$watch('selected', function(value) {
                if (value) {
                    scope.$broadcast('nameMatch', value);
                }
            });
            iElement.autocomplete({
                source: scope[iAttrs.items],
                select: function() {
                    $timeout(function() {
                        iElement.trigger('input');
                    }, 0);
                }
            });
        }
    }
});
user.directive('spotTable', function() {
    return {
        restrict: 'A',
        templateUrl: 'partials/table_layout.html',
        link: function(scope, element, attrs) {},
    }
});
user.directive('filterDirective', function() {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            scope.teams = {
                select_team: false,
                web_frontend: false,
                mobile_frontend: false,
                mobile_backend: false,
                data_mining: false,
                design_team: false,
                testing_team: false,
            };
            scope.jobs = {
                select_job: false,
                ux_designer: false,
                testing_engineer: false,
                senior_ux_designer: false,
                back_end_developer: false,
                senior_software_developer: false,
                software_developer: false,
                data_analyst: false,
                data_scientist: false,
                frontend_developer: false,
                full_stack_developer: false,
            }
            scope.dynamicPopover = {
                templateUrl: 'partials/myPopoverTemplate.html',
            };
        }
    }
});
user.directive('customPopover', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            var func = function(el) {$timeout(function() {
                    if ($(el).hasClass('table-occupied')) {
                    el.attr('draggable', 'true');
                    el.bind("dragstart", function(e) {
                        scope.emailData.emailInitialTable = scope.parentkey;
                        e.dataTransfer.setData("Text", JSON.stringify(scope.childValue));
                        $(el).css('background-color', 'red');
                        scope.origin.element = el;
                        scope.origin.ParentKey = angular.copy(scope.parentkey);
                        scope.origin.ChildKey = angular.copy(scope.childkey);
                    })
                } else {
                    el.bind('dragenter', function(e) {
                        if (e.preventDefault) {
                            e.preventDefault(); // Necessary. Allows us to drop.
                        }
                        if (e.stopPropogation) {
                            e.stopPropogation(); // Necessary. Allows us to drop.
                        }
                        return true;
                    });
                    el.bind('drop', function(e) {
                        if (e.preventDefault) {
                            e.preventDefault(); // Necessary. Allows us to drop.
                        }
                        if (e.stopPropogation) {
                            e.stopPropogation(); // Necessary. Allows us to drop.
                        }
                        var data = e.dataTransfer.getData("Text");
                        var data = JSON.parse(data);
                        scope.setData(data, scope.parentkey, scope.childkey);
                        scope.setData(null,scope.origin.ParentKey,scope.origin.ChildKey);
                        $('#email-message').css('display', 'block');
                        scope.emailData.emailName = data.name;
                        scope.emailData.emailFinalTable = scope.parentkey;
                        scope.$emit('serviceChanged');
                        $(scope.origin.element).css('background-color','#B3B3B3');
                        $(scope.origin.element).attr('draggable','');
                        $timeout(function() {
                            $('#email-message').css('display', 'none');
                        }, 2000);
                        func(el);
                        func(scope.origin.element);
                        return false;
                    });
                    el.bind('dragover', function(e) {
                        if (e.preventDefault) {
                            e.preventDefault(); // Necessary. Allows us to drop.
                        }
                        if (e.stopPropogation) {
                            e.stopPropogation(); // Necessary. Allows us to drop.
                        }
                    })
                }
            }, false);
}
            func(el);
            $(el).popover({
                trigger: 'hover',
                container:'body',
                html: true,
                content: function() {
                    return $(el).find('.heyy').html();
                },
                placement: attrs.popoverPlacement
            });
            scope.$on('nameMatch', function(event, name) {
                var initialBgColor = $(el).css('background-color');
                if(scope.flags.teamFlag || scope.flags.jobsFlag){
                    if( $(el).hasClass('search-result') && scope.childValue.name && (name.toLowerCase() === scope.childValue.name.toLowerCase())){
                        $(el).popover('show');
                    } else {
                        if (initialBgColor === 'rgb(0, 174, 239)') {
                        $(el).css('background-color', 'black');
                    } else {
                        $(el).css('background-color', initialBgColor);
                    }
                    $(el).popover('hide');
                    }
                } else {
                if (scope.childValue.name && (name.toLowerCase() === scope.childValue.name.toLowerCase())) {
                    $(el).popover('show');
                    $(el).css('background-color', 'rgb(0, 174, 239)');
                } else {
                    if (initialBgColor === 'rgb(0, 174, 239)') {
                        $(el).css('background-color', 'black');
                    } else {
                        $(el).css('background-color', initialBgColor);
                    }
                    $(el).popover('hide');
                }
            }
            });
            scope.$on('teamSelected', function(event, name) {
                var initialBgColor = $(el).css('background-color');
                for (var i in scope.teams) {
                    if ((scope.teams[i] == true) && scope.childValue.team && (scope.childValue.team.toLowerCase() === i.replace(/_| /g, ' '))) {
                        $(el).addClass('search-result');
                    } else if((scope.teams[i] == false) && scope.childValue.team && (scope.childValue.team.toLowerCase() === i.replace(/_| /g, ' '))){
                       $(el).removeClass('search-result');
                    }
                }
                for (var i in scope.jobs) {
                    if ((scope.jobs[i] == true) && scope.childValue.designation && (scope.childValue.designation.toLowerCase() === i.replace(/_| /g, ' '))) {
                        $(el).addClass('search-result');
                    }
                }
            });
            scope.$on('jobSelected', function(event, name) {
                var initialBgColor = $(el).css('background-color');
                for (var i in scope.jobs) {
                    if ((scope.jobs[i] == true) && scope.childValue.designation && (scope.childValue.designation.toLowerCase() === i.replace(/_| /g, ' '))) {
                        $(el).addClass('search-result');
                    } else if((scope.jobs[i] == false) && scope.childValue.designation && (scope.childValue.designation.toLowerCase() === i.replace(/_| /g, ' '))){
                       $(el).removeClass('search-result');
                    }
                }
                for (var i in scope.teams) {
                    if ((scope.teams[i] == true) && scope.childValue.team && (scope.childValue.team.toLowerCase() === i.replace(/_| /g, ' '))) {
                        $(el).addClass('search-result');
                    }
                }
            });
        }
    };
});
user.factory('tableData', [
    function() {
        var tableFunc = {};
        var tableData = {
            'table1': {
                '1': {
                    'img': 'images/pic1.jpeg',
                    'name': 'Shantanu',
                    'designation': 'Full Stack Developer',
                    'team': 'Web Frontend',
                    'currentProject': 'Website refactoring',
                },
                '2': {
                    'img': 'images/pic2.jpeg',
                    'name': 'Saina',
                    'designation': 'Frontend Developer',
                    'team': 'Web Frontend',
                    'currentProject': 'Website refactoring',
                },
                '3': {},
                '4': {
                    'img': 'images/pic3.jpeg',
                    'name': 'Aakash',
                    'designation': 'Frontend Developer',
                    'team': 'Web Frontend',
                    'currentProject': 'Website refactoring',
                }
            },
            'table2': {
                '1': {
                    'img': 'images/pic4.jpeg',
                    'name': 'Kishore',
                    'designation': 'Senior Software Developer',
                    'team': 'Mobile Frontend',
                    'currentProject': 'Social App Design',
                },
                '2': {},
                '3': {},
                '4': {
                    'img': 'images/pic5.jpeg',
                    'name': 'Zoya',
                    'designation': 'Backend Developer',
                    'team': 'Mobile Backend',
                    'currentProject': 'Social App Design',
                }
            },
            'table3': {
                '1': {},
                '2': {},
                '3': {
                    'img': 'images/pic6.jpeg',
                    'name': 'Naren',
                    'designation': 'Data Scientist',
                    'team': 'Data Mining',
                    'currentProject': 'Customer Loyality',
                },
                '4': {
                    'img': 'images/pic7.jpeg',
                    'name': 'Shilpy',
                    'designation': 'Data Analyst',
                    'team': 'Data Mining',
                    'currentProject': 'Customer Loyality',
                }
            },
            'table4': {
                '1': {
                    'img': 'images/pic8.jpeg',
                    'name': 'Shalini',
                    'designation': 'Software Developer',
                    'team': 'Mobile Backend',
                    'currentProject': 'Dell App APIs',
                },
                '2': {
                    'img': 'images/pic9.jpeg',
                    'name': 'Udeept',
                    'designation': 'Senior Software Developer',
                    'team': 'Mobile Backend',
                    'currentProject': 'Dell App APIs',
                },
                '3': {
                    'img': 'images/pic10.jpeg',
                    'name': 'Parth',
                    'designation': 'Back End Developer',
                    'team': 'Mobile Backend',
                    'currentProject': 'Dell App APIs',
                },
                '4': {}
            },
            'table5': {
                '1': {
                    'img': 'images/pic11.jpeg',
                    'name': 'Sameer',
                    'designation': 'UX Designer',
                    'team': 'Design Team',
                    'currentProject': 'Mobile App Design',
                },
                '2': {
                    'img': 'images/pic12.jpeg',
                    'name': 'Ankita',
                    'designation': 'Senior UX Designer',
                    'team': 'Design Team',
                    'currentProject': 'Mobile App Design',
                },
                '3': {
                    'img': 'images/pic13.jpeg',
                    'name': 'Vaibhav',
                    'designation': 'UX Designer',
                    'team': 'Design Team',
                    'currentProject': 'Mobile App Design',
                },
                '4': {
                    'img': 'images/pic14.jpeg',
                    'name': 'Shubhra',
                    'designation': 'UX Designer',
                    'team': 'Design Team',
                    'currentProject': 'Mobile App Design',
                }
            },
            'table6': {
                '1': {},
                '2': {
                    'img': 'images/pic15.jpeg',
                    'name': 'Shilpy',
                    'designation': 'Testing Engineer',
                    'team': 'Testing Team',
                    'currentProject': 'App Testing',
                },
                '3': {
                    'img': 'images/pic16.jpeg',
                    'name': 'Shilpy',
                    'designation': 'Testing Engineer',
                    'team': 'Testing Team',
                    'currentProject': 'App Testing',
                },
                '4': {}
            }
        };
        tableFunc.getData = function() {
            return tableData;
        };
        tableFunc.getLength = function() {
            return Object.keys(tableData).length;
        }
        tableFunc.setData = function() {
            return function(obj, parent, child) {
                tableData[parent][child] = obj;
            }
        }
        return tableFunc;
    }
]);
jQuery.event.props.push('dataTransfer');