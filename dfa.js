var FARule = function (state, character, next_state) {
   this.applies_to = function (s, c) {
      return state == s && character == c;
   };
   this.follow = function () {
      return next_state;
   };
   this.toString = function () {
      return "#<FARule " + state + " --" + character + "-->" + next_state + ">";
   };
};

var DFARulebook = function (rules) {
   this.next_state = function (state, character) {
      return this.rule_for(state, character).follow();
   };
   this.rule_for = function (state, character) {
      for (var i = 0; i < rules.length; i++) {
         if (rules[i].applies_to(state, character)) {
            return rules[i];
         }
      }
   };
};

var rulebook = new DFARulebook([
   new FARule(1, 'a', 2),
   new FARule(1, 'b', 1),
   new FARule(2, 'a', 2),
   new FARule(2, 'b', 3),
   new FARule(3, 'a', 3),
   new FARule(3, 'b', 3)
]);

var DFA = function (current, accept, rulebook) {
   current = current;
   this.read_string = function (s) {
      for (var i = 0; i < s.length; i++) {
         this.read_character(s[i]);
      }
   };
   this.read_character = function (c) {
      current = rulebook.next_state(current, c);
   };

   this.accepting = function () {
      for (var i = 0; i < accept.length; i++) {
         if (accept[i] == current) return true;
      }
      return false;
   };
};
var DFADesign = function (current, accept, rulebook) {
   this.accepts = function (s) {
      var dfa = new DFA(current, accept, rulebook);
      dfa.read_string(s);
      return dfa.accepting();
   };
};

var dfa = new DFADesign(1, [3], rulebook);

console.log(dfa.accepts('baaab'));