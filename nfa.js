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

NFARulebook.prototype.follow_free_moves = function (states) {

   var more_states = this.next_states(states, null);

   if (more_states.length === 0) return states;

   var new_states = more_states
   .filter(function (x) {
      return states.indexOf(x) < 0;
   });

   if (new_states.length > 0) {
      return this.follow_free_moves(states.concat(new_states));
   }

   return states;
};

NFARulebook.prototype.next_states = function (states, character) {
   var results = [];

   for (var i = 0; i < states.length; i++) {
      var state = states[i];
      this.follow_rules_for(state, character)
      .forEach(function (s) {
         if (results.indexOf(s) < 0) {
            results.push(s);
         }
      });
   }

   return results;
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
   current_states = [].concat(current_states);

   this.read_string = function (s) {
      for (var i = 0; i < s.length; i++) {
         this.read_character(s[i]);
      }
   };

   this.read_character = function (c) {
      current_states = rulebook.next_states(this.get_current_states(), c);
   };

   this.get_current_states = function () {
      return rulebook.follow_free_moves(current_states);
   };

   this.accepting = function () {
      var states = this.get_current_states();
      for (var i = 0; i < states.length; i++) {
         if (accept_states.indexOf(states[i]) >= 0) {
            return true;
         }
      }
      return false;
   };
};

var NFADesign = function (current, accept, rulebook) {
   this.start_state = current;
   this.accept_states = accept;
   this.rulebook = rulebook;

   this.accepts = function (s) {
      var nfa = new NFA(current, accept, rulebook);
      nfa.read_string(s);
      return nfa.accepting();
   };
};

var x = new NFADesign(1, [4], rulebook);
console.log(x.accepts('bbbbb')); //true
console.log(x.accepts('bbabb')); //false

// Free moves
var rulebook_free = new NFARulebook([
   new FARule(1, null, 2),
   new FARule(1, null, 4),
   new FARule(2, 'a', 3),
   new FARule(3, 'a', 2),
   new FARule(4, 'a', 5),
   new FARule(5, 'a', 6),
   new FARule(6, 'a', 4)
]);

console.log(rulebook_free.follow_free_moves([1]));

var design_2 = new NFADesign(1, [2, 4], rulebook_free);

console.log(design_2.accepts('aa')); //true
console.log(design_2.accepts('aaa')); //true
console.log(design_2.accepts('aaaaa')); //false

module.exports = {
   NFADesign: NFADesign,
   NFARulebook: NFARulebook,
   FARule: FARule
};
