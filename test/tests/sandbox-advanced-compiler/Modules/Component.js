Templar.component('MarkDown',{
  templateURL : 'Modules/Markdown.html',
  attributes : {},

  escapeSpecialRegexChars : function(input){
    return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  },
  
  syntaxHighlight : function(text, Rule){
    var  matches = null,
        output = text;
        
     while((matches = Rule.regex.exec(text)) != null){
        output = output.replace(new RegExp(this.escapeSpecialRegexChars(matches[0]),'g'), 
                            Rule.template.replace('%%',matches[Rule.matchIndex]));

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
  },
  onCreate : function(self){
    var contentNode = self.querySelector('[id=content]'),
        Rule = this.Rule,
        WHOLE_MATCH = 0,
        INCLUDE_QUOTES = 0,
        DONT_INCLUDE_QUOTES = 1;
    
    var HighlightRules = {
      string : new Rule(/(?:'|")([^'"]+)+?(?:'|")/gm, '<span class="sf-md-string-color">%%</span>', INCLUDE_QUOTES),
      singleLineCode : 
        new Rule(/`([^`]+)+?`/gm, '<code class="sf-md-sinlge-line-code">%%</code>'),
      htmlTags : 
        new Rule(/&lt;\/*[\s\d\w\-]+?&gt;|&lt;\/*([\s\d\w\-]+)+? */gm, '<span class="sf-md-html-tag">%%</span>', WHOLE_MATCH)
    };
    this.processMultiLineCode(contentNode, [HighlightRules.string,HighlightRules.htmlTags]);
    contentNode.innerHTML = this.syntaxHighlight(contentNode.innerHTML, HighlightRules.singleLineCode, false);
  }
  
});