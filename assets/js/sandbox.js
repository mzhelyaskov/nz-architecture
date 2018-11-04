var Sandbox = (function () {
	return {
		create: function (core, moduleSelector) {
			var CONTAINER = core.dom.query('#' + moduleSelector);
			return {
				find: function (selector) {
					return CONTAINER.query(selector);
				},
				findFirst: function (selector) {
					return this.find(selector)[0];
				},
				addEvent: function (element, type, fn) {
					core.dom.bind(element, type, fn);
				},
				removeEvent: function (element, type, fn) {
					core.dom.unbind(element, type, fn);
				},
				notify: function (event) {
					if (core.isObject(event) && event.type) {
						core.triggerEvent(event);
					}
				},
				subscribe: function (events) {
					if (core.isObject(events)) {
						core.registerEvents(events, moduleSelector);
					}
				},
				unsubscribe: function (events) {
					if (core.isArray(events)) {
						core.removeEvents(events, moduleSelector);
					}
				},
				createElement: function (element, config) {
					element = core.dom.create(element);
					if (config) {
						if (config.children && core.isArray(config.children)) {
							config.children.forEach(function (child) {
								element.appendChild(child);
							});
							delete config.children;
						}
						if (config.text) {
							element.appendChild(document.createTextNode(config.text));
							delete config.text;
						}
						core.dom.applyAttrs(element, config);
					}
					return element;
				}
			}
		}
	}
}());