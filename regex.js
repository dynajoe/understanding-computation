var extend = function (child, parent) {
   child.prototype = Object.create(parent.prototype);
   child.prototype.constructor = child;
};

var Pattern = function () { };

Pattern.prototype.bracket = function (outer) {
   if (this.precedence < outer) {
      return '(' + this.value + ')';
   }
   return this.value;
};

Pattern.prototype.toString = function () {
   return "/" + this.value + "/";
};

var Empty = function () {
   this.value = '';
   this.precedence = 3;
};

extend(Empty, Pattern);

var Literal = function (c) {
   this.value = c;
   this.precedence = 3;
};

extend(Literal, Pattern);

var Concatenate = function (first, second) {
   this.precedence = 1;
   this.value = first.bracket(this.precedence) + second.bracket(this.precedence);
};

extend(Concatenate, Pattern);

var Choose = function (first, second) {
   this.precedence = 0;
   this.value = first.bracket(this.precedence) + '|' + second.bracket(this.precedence);
};

extend(Choose, Pattern);

var Repeat = function (pattern) {
   this.precedence = 2;
   this.value = pattern.bracket(2) + '*';
};

extend(Repeat, Pattern);

var p = new Repeat(
   new Choose(
      new Concatenate(new Literal('a'), new Literal('b')),
      new Literal('a')
   )
);

console.log(p.toString())
