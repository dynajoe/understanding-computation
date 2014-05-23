var FARule = function (state, character, next_state) {
   this.state = state;
   this.character = character;
   this.next_state = next_state;
};

FARule.prototype.applies_to = function (s, c) {
   return this.state == s && this.character == c;
};

FARule.prototype.follow = function () {
   return this.next_state;
};

var NFARulebook = function (rules) {
   this.rules = rules;
};

NFARulebook.prototype.next_states = function (states, character) {
   var results = {};

   for (var i = 0; i < states.length; i++) {
      var state = states[i];
      this.follow_rules_for(state, character)
      .forEach(function (s) {
         results[s] = true;
      });
   }
   return Object.keys(results).map(function (x) {
      return parseInt(x, 10);
   });
};

NFARulebook.prototype.follow_rules_for = function (state, character) {
   var rules = this.rules_for(state, character);
   return rules.map(function (r) {
      return r.follow();
   });
};

NFARulebook.prototype.rules_for = function (state, character) {
   return this.rules.map(function (x) {
      if (x.applies_to(state, character)) {
         return x;
      }
   })
   .filter(function (x) {
      return x !== undefined;
   });
};

var rulebook = new NFARulebook([
   new FARule(1, 'a', 1),
   new FARule(1, 'b', 1),
   new FARule(1, 'b', 2),
   new FARule(2, 'a', 3),
   new FARule(2, 'b', 3),
   new FARule(3, 'a', 4),
   new FARule(3, 'b', 4)
]);

var NFA = function (current_states, accept_states, rulebook) {
   this.read_string = function (s) {
      for (var i = 0; i < s.length; i++) {
         this.read_character(s[i]);
      }
   };

   this.read_character = function (c) {
      current_states = rulebook.next_states(current_states, c);
   };

   this.accepting = function () {
      for (var i = 0; i < current_states.length; i++) {
         if (accept_states.indexOf(current_states[i]) >= 0) {
            return true;
         }
      }
      return false;
   };
};

var NFADesign = function (current, accept, rulebook) {
   this.accepts = function (s) {
      var nfa = new NFA(current, accept, rulebook);
      nfa.read_string(s);
      return nfa.accepting();
   };
};

var x = new NFADesign([1], [4], rulebook);
console.log(x.accepts('bbbbb')); //true
console.log(x.accepts('bbabb')); //false