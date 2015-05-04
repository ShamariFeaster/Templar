Templar.component('Codedown',{
  templateURL : 'Components/Codedown.html',
  attributes : {},

  escapeSpecialRegexChars : function(input){
    return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  },
  
  syntaxHighlight : function(text, Rule){
    var  matches = null,
        token = null,
        output = text;
        
     while((matches = Rule.regex.exec(text)) != null){
        token = Rule.transform.call(this, matches, Rule);
        output = output.replace(new RegExp(this.escapeSpecialRegexChars(token.token),'g'), 
                            Rule.template.replace('%%',token.tranformation));

    }
    return output;
  },
  
  processMultiLineCode : function(node, syntaxHighlightRules){
    var codeRX = /```([^`]+)+?```/gm,
        matches = null,
        output = node.innerHTML,
        highlightedText = '';
    while((matches = codeRX.exec(node.innerHTML)) != null){

      output = matches[1].replace(/</g, '&lt;');
      output = output.replace(/>/g, '&gt;');
      highlightedText = output;
      for(var x = 0; x < syntaxHighlightRules.length; x++){
        highlightedText = this.syntaxHighlight(highlightedText, syntaxHighlightRules[x]);
      }
      output = output.replace(output, '<code class="sf-md-multiline-bg">' +highlightedText+ '</code>');
      output = output.replace(/^(?: +)+|(?: +)+$/gm, function(match){
          var output = "";
          for(var i = 0; i < match.length; i++){
             output += "&nbsp;";
          }
          return output;});
      output = output.replace(/\n/g, '<br/>');
      node.innerHTML = node.innerHTML.replace(matches[0], output);
    }

  },
  Rule : function(regex, template, matchIndex){
    this.regex = regex
    this.template = template;
    this.matchIndex = (typeof matchIndex !== 'undefined') ? matchIndex : 1;
    this.transform = function(matches, Rule){
      return {token : matches[0], tranformation : matches[Rule.matchIndex], input : matches.input};};
  },
  onCreate : function(self){
    var contentNode = self.querySelector('[id=content]'),
        Rule = this.Rule,
        WHOLE_MATCH = 0,
        INCLUDE_QUOTES = 0,
        DONT_INCLUDE_QUOTES = 1;
    
    var HighlightRules = {
      string : new Rule(/(?:'|")([^'"]*)+?(?:'|")/gm, '<span class="sf-md-string-color">%%</span>', INCLUDE_QUOTES),
      NT : new Rule(/\{\{\w+\.\w+\}\}/gm, '<span>%%</span>', WHOLE_MATCH),
      singleLineCode : 
        new Rule(/`([^`]+)+?`/gm, '<code class="sf-md-sinlge-line-code">%%</code>'),
      htmlTags : 
        new Rule(/&lt;\/*[\s\d\w\-]+?&gt;|&lt;\/*([\s\d\w\-]+)+? */gm, '<span class="sf-md-html-tag">%%</span>', WHOLE_MATCH),
      MuliLineComments : 
        /* Credit to: http://blog.ostermiller.org/find-comment for multiline comment regex*/
        new Rule(/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+/gm, '<span class="sf-md-multi-comment">%%</span>', WHOLE_MATCH),
      HTMLComments : 
        new Rule(/&lt;!--[\s\S]*?--&gt;/gm, '<span class="sf-md-multi-comment">%%</span>', WHOLE_MATCH),
      jsKeywords : 
        new Rule(/(bool|int|return|var|continue|true|false|while|for|switch|case|this|function|if|else)\b/g, 
              '<span class="sf-md-js-keyword">%%</span>', WHOLE_MATCH),
    };
    
    HighlightRules.singleLineCode.transform = function(matches, Rule){
      var transformedToken = matches[Rule.matchIndex].replace(/>/g, '&gt;').replace(/</g, '&lt;');
      return {
        token : matches[0],
        tranformation : transformedToken,
        input : matches.input
      };
    }
    
    HighlightRules.HTMLComments.transform = HighlightRules.singleLineCode.transform;
    
    this.processMultiLineCode(contentNode, 
        [HighlightRules.string,
         HighlightRules.htmlTags, 
         HighlightRules.MuliLineComments, 
         HighlightRules.jsKeywords,
         HighlightRules.HTMLComments,
          ]);
    contentNode.innerHTML = this.syntaxHighlight(contentNode.innerHTML, HighlightRules.singleLineCode);
  }
  
});