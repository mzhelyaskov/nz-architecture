var Class = function () {
	var klass = function () {
		this.init.apply(this, arguments);
	};
	klass.prototype.init = function () {
	};
	return klass;
};

var Person = new Class();
Person.prototype.init = function () {
	console.log('init method');
};
Person.prototype.test = function () {
	console.log('test');
};
var person = new Person();
person.test();
