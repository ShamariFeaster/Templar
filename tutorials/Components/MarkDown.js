Templar.component('MarkDown',{
  templateURL : 'Components/Markdown.html',
  attributes : {},
  onCreate : function(self){
    
    function Rule(regex, template){
      this.regex = regex
      this.template = template;
    }
    
    var highlights = {
      string : new Rule(/(?:'|")([^'"]+)+?(?:'|")/gm, '<span class="sf-md-string-color">%%</span>'),
      singleLineCode : 
        new Rule(/`([^`]+)+?`/gm, '<code class="sf-md-sinlge-line-code">%%</code>')
    };

    function processMultiLineCode(node){
      var codeRX = /```([^`]+)+?```/gm,
          matches = null,
          output = node.innerHTML,
          matchFound = false;
      while((matches = codeRX.exec(node.innerHTML)) != null){
        matchFound = true;
        output = matches[1].replace(/</g, '&lt;');
        output = output.replace(/>/g, '&gt;');
        output = output.replace(output, '<code class="sf-md-multiline-bg">' +syntaxHighlight(output, highlights.string)+ '</code>');
        output = output.replace(/^(?: +)+|(?: +)+$/gm, function(match){
            var output = "";
            for(var i = 0; i < match.length; i++){
               output += "&nbsp;";
            }
            return output;});
        output = output.replace(/\n/g, '<br/>');
        node.innerHTML = node.innerHTML.replace(matches[0], output);
      }
 
    }
    
    function escapeSpecialRegexChars(input){
      return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    
    function syntaxHighlight(text, Rule, includeQuotes){
      var  matches = null,
          output = text,
          includeQuotes = (typeof includeQuotes == 'undefined') ? true : includeQuotes,
          index = (includeQuotes == true) ? 0 : 1;
          
       while((matches = Rule.regex.exec(text)) != null){
          output = output.replace(new RegExp(escapeSpecialRegexChars(matches[0]),'g'), 
                              Rule.template.replace('%%',matches[index]));

      }
      return output;
    }
    
    var contentNode = self.querySelector('[id=content');
    processMultiLineCode(contentNode);
    
    contentNode.innerHTML = syntaxHighlight(contentNode.innerHTML, highlights.singleLineCode, false);
  }
  
});