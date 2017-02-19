$(document).ready(function() {
  var treeInstance = new Tree('.tree', {
    nodes: [{
      text: "中国",
      children: [{
        text: "浙江",
        children: [{
          text: "杭州",
        }, {
          text: "宁波",
        }, {
          text: "温州",
        }]
      }, {
        text: "上海",
        children: []
      }, {
        text: "江苏",
        children: [{
          text: "苏州",
        }, {
          text: "南京",
        }]
      }]
    }, {
      text: "中国",
      open: false,
      children: [{
        text: "浙江",
        children: [{
          text: "杭州",
        }, {
          text: "宁波",
        }, {
          text: "温州",
        }]
      }, {
        text: "上海",
        children: []
      }, {
        text: "江苏",
        children: [{
          text: "苏州",
        }, {
          text: "南京",
        }]
      }]
    }]
  });
  var inputTimeOut;
  $('#search').bind('input propertychange', function() {
    clearTimeout(inputTimeOut);
    inputTimeOut = setTimeout(function() {
      searchTree(this.value);
    }.bind(event.target), 500);
  });
  var searchTree = function(str) {
    treeInstance.search(str);
  };
  treeInstance.clickNode(function(dom) {
    console.log(dom.text());
    var text = dom.find('>span').text();
    $('.console').find('.select-node-info').text(text);
  });
  $('.remove').click(function() {
    var res = treeInstance.removeSelectNode();
    if (res.errMes) {
      alert(res.errMes);
    }
  });
  $('#addNode').click(function() {
    var addNodeWay = $('#addNodeWay').val();
    console.log(addNodeWay);
    var newNodeName = $('#newNodeName').val();
    console.log(newNodeName);
    var res = treeInstance.addNode({
      addNodeWay: addNodeWay,
      newNodeName: newNodeName
    });
    if (res.errMes) {
      alert(res.errMes);
    }else{
      $('#addModal').modal('hide');
      $('#newNodeName').val('');
      $('#addNodeWay').val(0);
    }
  });
});
