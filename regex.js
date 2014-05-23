var nfa = require('./nfa.js');
var NFADesign = nfa.NFADesign;
var NFARulebook = nfa.NFARulebook;
var FARule = nfa.FARule;

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

Pattern.prototype.matches = function (str) {
   return this.to_nfa_design().accepts(str);
};

var Empty = function () {
   this.value = '';
   this.precedence = 3;
   this.to_nfa_design = function () {
      var rulebook = new NFARulebook([]);
      var start_state = {};
      return new NFADesign(start_state, [start_state], rulebook);
   };
};

extend(Empty, Pattern);

var Literal = function (c) {
   this.value = c;
   this.precedence = 3;
   this.to_nfa_design = function () {
      var start_state = {};
      var accept_state = {};
      var rule = new FARule(start_state, c, accept_state);
      var rulebook = new NFARulebook([rule]);
      return new NFADesign(start_state, [accept_state], rulebook);
   };
};

extend(Literal, Pattern);

var Concatenate = function (first, second) {
   this.precedence = 1;
   this.value = first.bracket(this.precedence) + second.bracket(this.precedence);
   this.to_nfa_design = function () {
      var first_nfa = first.to_nfa_design();
      var second_nfa = second.to_nfa_design();

      var start_state = first_nfa.start_state;
      var accept_states = second_nfa.accept_states;

      var new_rules = first_nfa.rulebook.rules.concat(second_nfa.rulebook.rules);

      var extra_rules = first_nfa.accept_states.map(function (s) {
         return new FARule(s, null, second_nfa.start_state);
      });

      var rules = new_rules.concat(extra_rules);

      return new NFADesign(start_state, accept_states, new NFARulebook(rules));
   };
};

extend(Concatenate, Pattern);

var Choose = function (first, second) {
   this.precedence = 0;
   this.value = first.bracket(this.precedence) + '|' + second.bracket(this.precedence);

   this.to_nfa_design = function () {
      var first_nfa = first.to_nfa_design();
      var second_nfa = second.to_nfa_design();

      var start_state = {};

      var accept_states = second_nfa.accept_states.concat(first_nfa.accept_states);
      var new_rules = first_nfa.rulebook.rules.concat(second_nfa.rulebook.rules);

      var extra_rules = [first_nfa, second_nfa].map(function (nfa) {
         return new FARule(start_state, null, nfa.start_state);
      });

      var rules = new_rules.concat(extra_rules);

      return new NFADesign(start_state, accept_states, new NFARulebook(rules));
   };
};

extend(Choose, Pattern);

var Repeat = function (pattern) {
   this.precedence = 2;
   this.value = pattern.bracket(2) + '*';

   this.to_nfa_design = function () {
      var nfa = pattern.to_nfa_design();

      var start_state = {};
      var accept_states = nfa.accept_states.concat(start_state);

      var new_rules = nfa.rulebook.rules;

      var extra_rules = nfa.accept_states.map(function (s) {
         return new FARule(s, null, nfa.start_state);
      });

      var rules = new_rules
         .concat(extra_rules)
         .concat(new FARule(start_state, null, nfa.start_state));

      return new NFADesign(start_state, accept_states, new NFARulebook(rules));
   };
};

extend(Repeat, Pattern);

var p = new Repeat(
   new Choose(
      new Concatenate(new Literal('a'), new Literal('b')),
      new Literal('a')
   )
);

console.log(p.toString());

//Regex
console.log('regex nfa');
console.log(new Array(10).join('='));
var design = new Empty().to_nfa_design();

console.log(design.accepts('')); // true
console.log(design.accepts('a')); // false

design = new Literal('a').to_nfa_design();

console.log(design.accepts('')); // false
console.log(design.accepts('a')); // true

var pattern = new Concatenate(
   new Literal('a'),
   new Concatenate(new Literal('b'), new Literal('c'))
);

console.log('Joined Regex NFAs');
console.log(pattern.toString());
console.log(new Array(10).join('='));
console.log(pattern.matches('a')); //false
console.log(pattern.matches('ab')); //false
console.log(pattern.matches('abc')); //true

pattern = new Choose(
   new Literal('a'),
   new Literal('b')
);
console.log(pattern.toString());
console.log('a', '->', pattern.matches('a')); // true
console.log('b', '->', pattern.matches('b')); // true
console.log('c', '->', pattern.matches('c')); // false

pattern = new Repeat(new Literal('a'));
console.log(pattern.toString());
console.log('', '->', pattern.matches('')); // true
console.log('a', '->', pattern.matches('a')); // true
console.log('aaa', '->', pattern.matches('aaa')); // true
console.log('b', '->', pattern.matches('b')); // false

