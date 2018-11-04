var Core = (function () {

	var moduleRepository = {};
	var debug = false;

	return {
		debug: function (on) {
			debug = !!on;
		},
		createModule: function (moduleId, creator) {
			moduleRepository[moduleId] = {
				create: creator,
				instance: null
			};
		},
		start: function (moduleId) {
			var module = moduleRepository[moduleId];
			if (module) {
				module.instance = this.createModuleInstance(moduleId);
				module.instance.init();
			}
		},
		createModuleInstance: function (moduleId) {
			var core = this;
			var module = moduleRepository[moduleId];
			var instance = module.create(Sandbox.create(this, moduleId));
			if (!debug) {
				var methodProperties = Object.keys(instance).filter(function (property) {
					return typeof instance[property] === 'function';
				});
				methodProperties.forEach(function (property) {
					instance[property] = function (property, method) {
						return function () {
							try {
								return method.apply(this, arguments);
							} catch (ex) {
								core.log(1, property + "(): " + ex.message);
							}
						}
					}(property, instance[property]);
				});
			}
			return instance;
		},
		startAll: function () {
			for (var moduleId in moduleRepository) {
				if (moduleRepository.hasOwnProperty(moduleId)) {
					this.start(moduleId);
				}
			}
		},
		stop: function (moduleId) {
			var moduleData = moduleRepository[moduleId];
			if (moduleData && moduleData.instance) {
				moduleData.instance.destroy();
				moduleData.instance = null;
			}
		},
		stopAll: function () {
			for (var moduleId in moduleRepository) {
				if (moduleRepository.hasOwnProperty(moduleId)) {
					this.stop(moduleId);
				}
			}
		},
		registerEvents: function (events, moduleId) {
			if (this.isObject(events) && moduleId) {
				var module = moduleRepository[moduleId];
				if (module) {
					module.events = events;
				}
			} else {
				this.log(1, "Error when register events");
			}
		},
		triggerEvent: function (event) {
			for (var moduleId in moduleRepository) {
				if (moduleRepository.hasOwnProperty(moduleId)) {
					var module = moduleRepository[moduleId];
					var eventHandler = module.events && module.events[event.type];
					if (eventHandler) {
						eventHandler(event.data);
					}
				}
			}
		},
		removeEvents: function (events, moduleId) {
			var module = moduleRepository[moduleId];
			if (this.isObject(events) && module && module.events) {
				delete module.events;
			}
		},
		log: function (severity, message) {
			if (debug) {
				var severityType = {
					'1': 'log',
					'2': 'warn',
					'3': 'error'
				};
				console[severityType[severity]](message);
			} else {
				//send to the server
			}
		},
		dom: {
			query: function (selector, context) {
				var self = this, jqEls;
				if (context && context.find) {
					jqEls = context.find(selector);
				} else {
					jqEls = jQuery(selector);
				}
				var ret = jqEls.get();
				ret.query = function (selector) {
					return self.query(selector, jqEls);
				};
				return ret;
			},
			bind: function (element, type, fn) {
				if (element && typeof type === 'function') {
					fn = type;
					type = 'click';
				}
				jQuery(element).bind(type, fn);
			},
			unbind: function (element, type, fn) {
				if (element && typeof type === 'function') {
					fn = type;
					type = 'click';
				}
				jQuery(element).unbind(type, fn);
			},
			create: function (element) {
				return document.createElement(element);
			},
			applyAttrs: function (element, attrs) {
				jQuery(element).attr(attrs);
			}
		},
		isArray: function (arr) {
			return jQuery.isArray(arr);
		},
		isObject: function (obj) {
			return jQuery.isPlainObject(obj);
		}
	}
}());

$(function () {
	Core.startAll();
});