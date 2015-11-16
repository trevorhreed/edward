console.clear();

var sally = (function(){
  return function(doc, win){
    var sel = {
      start: -1,
      end: -1,
      first: -1,
      last: -1,
      caret: -1,
      caretNode: null,
      type: null,
      set: function(node, index){
        var range = doc.createRange(),
            sel = win.getSelection();
        range.selectNodeContents(node, index || 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    function onSelectionChanged(){
      var current = win.getSelection(),
          range = current.getRangeAt(0);
      sel.type = current.type.toLowerCase();
      if(sel.type == 'range'){
        sel.start = current.anchorOffset;
        sel.end = current.focusOffset;
        sel.first = Math.min(sel.start, sel.end);
        sel.last = Math.max(sel.start, sel.end);
        sel.caret = -1;
      }else {
        sel.start = sel.end = sel.first = sel.last = -1;
        sel.caret = current.focusOffset;
        sel.caretNode = current.focusNode;
      }
    }

    doc.addEventListener('mouseup', onSelectionChanged);
    doc.addEventListener('keyup', onSelectionChanged);

    return sel;
  }
})();

var editor = (function(){
  var selection,
      editorElm,
      doc, iframeEl,
      commands = {
        'b': { name: 'bold' },
        'i': {},        'u': {},        's': {},        'h1': {},        'h2': {},        'h3': {},        'h4': {},        'h5': {},        'h6': {},        'paragraph': {},        'ul': {},        'ol': {},        'a': {},        'unlink': {},        'blockquote': {},        'indent': {},        'outdent': {},        'hr': {},        'img': {},        'justifyLeft': {},        'justifyCenter': {},        'justifyFull': {},        'justifyRight': {},        'removeFormat': {},        'cut': {},        'copy': {},        'paste': {},        'selectAll': {},        'undo': {},        'redo': {}        
      };
  function _command(key, value){
    var command = commands[key];
    doc.execCommand(command.name, false, command.value || '');
    iframeEl.contentWindow.focus();
  }
  
  function _create(id){
    var editorEl = document.getElementById(id);
    editorEl.contentEditable = true;
    iframeEl = document.createElement('iframe');
    iframeEl.style.width = '100%';
    iframeEl.style.height = '100%';
    //iframeEl.style.border = '0';
    editorEl.appendChild(iframeEl);
    selection = sally(iframeEl.contentDocument, iframeEl.contentWindow);
    iframeEl.contentDocument.designMode = 'on';
    doc = iframeEl.contentDocument;
    doc.addEventListener('keydown', function(e){
      if(e.which == 13){
        var start = selection.caret,
            end = selection.caretNode.textContent.length,
            pre = selection.caretNode.textContent.substring(0, start),
            post = selection.caretNode.textContent.substring(start, end);
        selection.caretNode.textContent = pre;
        var p = document.createElement('P');
        p.innerText = post;
        var currentNode = selection.caretNode.parentNode != doc.body
          ? selection.caretNode.parentNode
          : selection.caretNode;
        if(currentNode.nextSibling){
          currentNode.parentNode.insertBefore(p, currentNode.nextSibling);
        }else{
          currentNode.parentNode.appendChild(p);
        }
        selection.set(p);
        e.preventDefault();
      }
    })
    doc.addEventListener('keypress', function(e){
      console.dir(selection.caretNode);
    })
    doc.body.innerHTML = '<p>Hello</p>';
  }
  
  function _html(content){
    if(content !== void 0){
      doc.body.innerHTML = content;
    }
    return doc.body.innerHTML;
  }
  
  function _text(content){
    if(content !== void 0){
      doc.body.innerText = content;
    }
    return doc.body.innerText;
  }
  
  function _on(event, handler, useCapture){
    if(event.toLowerCase() == 'domsubtreemodified'){
      doc.body.addEventListener(event, function(){
        handler = typeof handler == 'function' ? handler : function(){};
        handler(doc.body);
      }, !!useCapture)
    }
  }
  
  return {
    create: _create,
    command: _command,
    html: _html,
    on: _on
  }
  
})();

$(function(){
  editor.create('editor');
  editor.on('DOMSubtreeModified', function(body){
    $('#html').text(body.innerHTML);
  })
  $('.tool').on('click', function(){
    var command = $(this).attr('data-cmd');
    editor.command(command);
    console.log(editor.html());
  })
})
