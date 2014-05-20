var extend = function (child, parent) {
   child.prototype = Object.create(parent.prototype);
   child.prototype.constructor = child;
};

var Operator = function (left, right, operator, ctor, res, str) {
   this.toString = function () {
      return left + " " + str + " " + right;
   };

   this.reducible = true;

   this.reduce = function (environment) {
      if (left.reducible)
         return new ctor(left.reduce(environment), right);
      else if (right.reducible)
         return new ctor(left, right.reduce(environment));
      else
         return new res(operator(left.value, right.value));
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

   this.reducible = false;
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
   this.reducible = true;

   this.toString = function () {
      return name;
   };

   this.reduce = function (environment) {
      return environment[name];
   };
};

var Assign = function (name, expression) {
   this.reducible = true;

   this.toString = function () {
      return name + ' = ' + expression;
   };

   this.reduce = function (env) {
      if (expression.reducible) {
         return [new Assign(name, expression.reduce(env)), env];
      } else {
         var new_env = Object.create(env);
         new_env[name] = expression;
         return [new DoNothing(), new_env];
      }
   };
};

var DoNothing = function () {
   this.reducible = false;

   this.toString = function () {
      return 'do-nothing';
   };

   this.equals = function (other) {
      return other instanceof DoNothing;
   };
};

var If = function (condition, consequence, alternative) {
   this.reducible = true;

   this.toString = function () {
      return "if (" + condition + ") { " + consequence + " } else { " + alternative + " } ";
   };

   this.reduce = function (environment) {
      if (condition.reducible) {
         return [new If(condition.reduce(environment), consequence, alternative), environment];
      }
      else {
         if (condition.value) {
            return [consequence, environment];
         }
         else {
            return [alternative, environment];
         }
      }
   };
};

var Sequence = function (first, second) {
   this.reducible = true;

   this.toString = function () {
      return first + "; "+ second;
   };

   this.reduce = function (env) {
      if (first instanceof DoNothing) {
         return [second, env];
      }
      else {
         var result = first.reduce(env);
         return [new Sequence(result[0], second), result[1]];
      }
   };
};

var While = function (condition, body) {
   this.reducible = true;

   this.toString = function () {
      return "while (" + condition + ") { " + body + " }";
   };

   this.reduce = function (env) {
      return [new If(condition, new Sequence(body, this), new DoNothing()), env];
   }.bind(this);
};

var Machine = function (statement, environment) {
   var step = function () {
      var result = statement.reduce(environment);
      statement = result[0];
      environment = result[1];
   };

   this.run = function () {
      while (statement.reducible) {
         console.log(statement.toString(), environment);
         step();
      }
      console.log(statement.toString(), environment);
   };
};

var statement = new While(
   new LessThan(new Variable('x'), new Num(5)),
   new Assign('x', new Multiply(new Variable('x'), new Num(3)))
);

new Machine(statement, { x: new Num(1) }).run();

