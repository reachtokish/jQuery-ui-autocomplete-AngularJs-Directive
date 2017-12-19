var app = angular.module("myApp", []);

app.directive("gridScreen", function($http) {
	return {
		restrict: "E",
		controller: function($scope) {
			this.setEditor = function(editor) {

			}
			this.setColumns = function(cols) {
				$scope.cols = cols
			}
		},
		link: function(scope, element, attributes) {
			$http.get(attributes.resource)
				.then(function(response) {
					scope.rows = response.data;
					scope.$broadcast("ready-to-render", scope.rows, scope.cols);
				});
		}
	}
});

app.directive("gridColumns", function() {
	return {
		restrict: "E",
		require: ["^gridScreen", "gridColumns"],
		controller: function() {
			var columns = [];
			this.addColumn = function(col) {
				columns.push(col);
			}
			this.getColumns = function() {
				return columns;
			}
		},
		link: function(scope, element, attributes, controller) {
			var gridScreenController = controller[0];
			var gridColumnsController = controller[1];
			gridScreenController.setColumns(gridColumnsController.getColumns());
		}
	}
});

app.directive("gridColumn", function() {
	return {
		restrict: "E",
		require: "^gridColumns",
		link: function(scope, element, attributes, gridColumnssController) {
			gridColumnssController.addColumn({
				title: attributes.title,
				field: attributes.field
			})
		}
	}
});

app.directive("grid", function() {
	return {
		restrict: "E",
		templateUrl: "./templates/as_tables.html",
		replace: true,
		controller: function($scope) {
			$scope.$on('ready-to-render', function(e, rows, cols) {
				$scope.rows = rows;
				$scope.cols = cols;
			})
		}
	}
});

app.directive("withInlineEditor", function() {
	return {
		restrict: "E"
	}
});

app.directive("uiAutocomplete", function($http, $timeout) {
	return {
		restrict: "A",
		controller: function ($scope) {
		},
		link: function(scope, element, attributes, controller) {

			var eventsAndOptions = scope[attributes.uiAutocomplete].options;

			var autoC = element.autocomplete(eventsAndOptions)
				.autocomplete("instance")._renderItem = function( ul, item ) {
					var highlisghtMatches = item.PRODUCT_NAME.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("
							+ $.ui.autocomplete.escapeRegex(this.term)
							+ ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong class='highlight'>$1</strong>");
					return $("<li>").append("<a href='javascript:void(0);'><div class='angucomplete-title'>"
							+ highlisghtMatches + "</div><div class='angucomplete-description'>Up To "
							+ item.CASH_BACK
							+ " AED cashback / "
							+ item.OFFERS_COUNT
							+ " coupon</div></a>")
						.appendTo(ul);
				};

			element.on("autocompletefocus", function(event, ui) {
				scope[attributes.uiAutocomplete].events.focus(element, event, ui);
				return false;
			});

			element.on("autocompleteselect", function(event, ui) {
				scope[attributes.uiAutocomplete].events.select(element, event, ui);
				return false;
			});

		}
	}
})

app.controller("myCtrl", function($scope, $http) {

	var jsonData = function (request, response) {
		$http.get("http://beta.cashbacksouq.com/getAutoSuggestProductList?reqKeyword=" + request.term)
			.then(function(data) {
				response(data.data.response.docs);
			}, function() {
				console.log(data);
			});
	}

	$scope.myOptions = {
		options: {
			delay: 0,
			source: jsonData,
			appendTo: "body",
		},
		events: {
			focus: function(element, event, ui) {
				element.val(ui.item.PRODUCT_NAME);
			},
			select: function(element, event, ui) {
				element.val(ui.item.PRODUCT_NAME);
			}
		}
	}

});