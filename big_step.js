var extend = function (child, parent) {
   child.prototype = Object.create(parent.prototype);
   child.prototype.constructor = child;
};

var Operator = function (left, right, operator, ctor, res, str) {
   this.toString = function () {
      return left + " " + str + " " + right;
   };

   this.evaluate = function (environment) {
      return new res(operator(left.evaluate(environment).value, right.evaluate(environment).value));
   };
};

var Divide = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 / num2;
   }, Divide, Num, '/');
};

extend(Divide, Operator);

var Multiply = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 * num2;
   }, Multiply, Num, '*');
};

extend(Multiply, Operator);

var Add = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 + num2;
   }, Add, Num, '+');
};

extend(Add, Operator);

var Subtract = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 - num2;
   }, Subtract, Num, '-');
};

extend(Subtract, Operator);

var GreaterThan = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 > num2;
   }, GreaterThan, Bool, '>');
};

extend(GreaterThan, Operator);

var GreaterThanOrEqual = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 >= num2;
   }, GreaterThanOrEqual, Bool, '>=');
};

extend(GreaterThanOrEqual, Operator);

var LessThan = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 < num2;
   }, LessThan, Bool, '<');
};

extend(LessThan, Operator);

var LessThanOrEqual = function (left, right) {
   Operator.call(this, left, right, function (num1, num2) {
      return num1 <= num2;
   }, LessThanOrEqual, Bool, '<=');
};

extend(LessThanOrEqual, Operator);

var Value = function (value) {
   this.value = value;

   this.toString = function () {
      return value.toString();
   };

   this.evaluate = function (env) {
      return this;
   }.bind(this);
};

var Num = function (value) {
   Value.call(this, value);
};

extend(Num, Value);

var Bool = function (value) {
   Value.call(this, value);
};

extend(Bool, Value);

var Variable = function (name) {
   this.name = name;

   this.toString = function () {
      return name;
   };

   this.evaluate = function (environment) {
      return environment[name];
   };
};

var Assign = function (name, expression) {
   this.toString = function () {
      return name + ' = ' + expression;
   };

   this.evaluate = function (env) {
      env[name] = expression.evaluate(env);
      return env;
   };
};

var DoNothing = function () {
   this.toString = function () {
      return 'do-nothing';
   };

   this.evaluate = function (env) {
      return env;
   };
};

var If = function (condition, consequence, alternative) {
   this.toString = function () {
      return "if (" + condition + ") { " + consequence + " } else { " + alternative + " } ";
   };

   this.evaluate = function (environment) {
      if (condition.evaluate(environment).value) {
         return consequence.evaluate(environment);
      }
      else {
         return alternative.evaluate(environment);
      }
   };
};

var Sequence = function (first, second) {
   this.toString = function () {
      return first + "; "+ second;
   };

   this.evaluate = function (env) {
     return second.evaluate(first.evaluate(env));
   };
};

var While = function (condition, body) {
   this.toString = function () {
      return "while (" + condition + ") { " + body + " }";
   };

   this.evaluate = function (env) {
      if (condition.evaluate(env).value) {
         return this.evaluate(body.evaluate(env));
      }
      else {
         return env;
      }
   }.bind(this);
};

var statement = new While(
   new LessThan(new Variable('x'), new Num(5)),
   new Assign('x', new Multiply(new Variable('x'), new Num(3)))
);

var sequence = new Sequence(
   new Assign('x', new Add(new Num(1), new Num(1))),
   new Assign('y', new Add(new Variable('x'), new Num(3)))
);

console.log(sequence.evaluate({ }));
console.log(statement.evaluate({ x: new Num(3) }));

