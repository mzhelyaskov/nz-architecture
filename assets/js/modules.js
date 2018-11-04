Core.createModule('search-box', function (sb) {
	var input, button, reset;

	return {
		init: function () {
			input = sb.findFirst("#search-input");
			button = sb.findFirst('#search-btn');
			reset = sb.findFirst('#reset-btn');
			sb.addEvent(button, "click", this.handleSearch);
			sb.addEvent(reset, "click", this.quitSearch);
		},
		handleSearch: function () {
			var query = input.value;
			if (query) {
				sb.notify({
					type: 'perform-search',
					data: query
				});
			}
		},
		quitSearch: function () {
			input.value = '';
			sb.notify({
				type: 'quit-search',
				data: null
			});
		},
		destroy: function () {
			sb.removeEvent(button, 'click', this.handleSearch);
			sb.removeEvent(reset, 'click', this.resetSearch);
			input = button = reset = null;
		}
	}
});

Core.createModule('filter-bar', function (sb) {
	var filters;

	return {
		init: function () {
			filters = sb.find('a');
			sb.addEvent(filters, 'click', this.filterProducts);
		},
		filterProducts: function (event) {
			sb.notify({
				type: 'change-filter',
				data: event.currentTarget.innerText
			});
		},
		destroy: function () {
			sb.removeEvent(filters, 'click', this.filterProducts);
		}
	}
});

Core.createModule('product-panel', function (sb) {
	var products;

	return {
		init: function () {
			var self = this;
			products = sb.find('li');
			sb.subscribe({
				'change-filter': this.changeFilter.bind(this),
				'reset-filter': this.reset.bind(this),
				'perform-search': this.search.bind(this),
				'quit-search': this.reset.bind(this)
			});
			eachProduct(function (product) {
				sb.addEvent(product, 'click', self.addToCart);
			})
		},
		reset: function () {
			eachProduct(function (product) {
				product.style.opacity = '1';
			})
		},
		changeFilter: function (filter) {
			this.reset();
			var filterString = filter.toLowerCase();
			eachProduct(function (product) {
				var keywords = product.getAttribute('data-8088-keyword').toLowerCase();
				if (keywords.indexOf(filterString) < 0) {
					product.style.opacity = '0.2';
				}
			})
		},
		search: function (query) {
			var queryString = query.toLowerCase();
			eachProduct(function (product) {
				var productDescription = product.querySelector('p').innerHTML.toLowerCase();
				if (productDescription.indexOf(queryString) < 0) {
					product.style.opacity = '0.2';
				}
			})
		},
		addToCart: function (event) {
			var productElement = event.currentTarget;
			sb.notify({
				type: 'add-item',
				data: {
					id: productElement.id,
					name: productElement.querySelector('p').innerHTML,
					price: 123
				}
			});
		},
		destroy: function () {
			var self = this;
			eachProduct(function (product) {
				sb.removeEvent(product, 'click', self.addToCart);
			});
			sb.unsubscribe([
				'change-filter',
				'reset-filter',
				'perform-search',
				'quit-search'
			]);
		}
	};

	function eachProduct(fn) {
		var i = 0, product;
		for (; product = products[i++];) {
			fn(product);
		}
	}
});

Core.createModule('shopping-curt', function (sb) {
	var cart, cartItems;

	return {
		init: function () {
			cart = sb.findFirst("ul");
			cartItems = {};
			sb.subscribe({
				'add-item': this.addItem
			});
		},
		addItem: function (product) {
			var productId = +product.id;
			var entry = sb.findFirst('#cart-' + productId + ' .quantity');
			if (entry) {
				entry.innerHTML = parseInt(entry.innerHTML, 10) + 1;
				cartItems[productId]++;
			} else {
				entry = sb.createElement("li", {
					id: 'cart-' + productId,
					class: 'cart-entry',
					children: [
						sb.createElement('span', {'class': 'product_name', text: product.name}),
						sb.createElement('span', {'class': 'quantity', text: '1'}),
						sb.createElement('span', {'class': 'price', text: '$' + productId.toFixed(2)})
					]
				});
				cart.appendChild(entry);
				cartItems[productId] = 1;
			}
		},
		destroy: function () {
			cart = cartItems = null;
			sb.unsubscribe(['add-item']);
		}
	}
});