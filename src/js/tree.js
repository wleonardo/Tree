'use strict';
(function(factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) { // AMD
    define(['jquery'], factory);
  } else if (typeof exports == "object" && typeof module == "object") { // CommonJS
    var jquery = (typeof window !== 'undefined') ? (window.$ || window.jQuery) : undefined;
    if (!jquery) {
      try {
        jquery = require('jquery');
        if (!jquery.fn) jquery.fn = {}; //isomorphic issue
      } catch (e) {
        if (!jquery) throw new Error('jQuery dependency not found');
      }
    }
    module.exports = factory(jquery);
  } else { // Browser
    factory(jQuery);
  }
})(function($, undefined) {
  var ADD_NODE_WAY = {
    ADD_CHILD_NODE: 0,
    ADD_BROTHER_NODE: 1
  };

  function deepIteratorAndChangeProperty(arr, str, obj, cancelObj) {
    arr.forEach(function(value) {
      if (value.text.indexOf(str) >= 0) {
        $.extend(value, obj);
      } else {
        $.extend(value, cancelObj);
      }
      if (value.children && value.children.length) {
        deepIteratorAndChangeProperty(value.children, str, obj, cancelObj);
      }
    });
  }

  var Tree = function(elem, userOption) {
    if (!elem) return false;
    var defaultOptions = {};
    var option = {};

    $.extend(option, defaultOptions, userOption);

    this.nodes = option.nodes;

    function nodeError(node) {
      if (typeof node !== 'object') {
        throw Error('node不是object');
        return true;
      }
    }

    function hasChildren(node) {
      if (nodeError(node)) {
        return false;
      }
      return node.children && node.children.length;
    };

    function isNodeOpen(node) {
      if (nodeError(node)) {
        return false;
      }
      return node.open || node.searched;
    }

    function isRootNode(sort) {
      return sort === undefined;
    }

    function isForceClosed(node) {
      return node.open === false;
    }

    /**
     * [getArrayDeep 深度遍历获取数组中指定的内容]
     */
    this.getArrayDeep = function(arr, sortList) {
      if (sortList.length > 1) {
        var newSortList = sortList.slice(1);
        var cache = this.getArrayDeep(arr[sortList[0]].children, newSortList);
      } else {
        return arr[sortList[0]];
      }
      return cache;
    };

    /**
     * [createDomTree 递归nodes数组，生出对于的dom树，通过这个函数打通数组和最后的dom结构，使其他地方只需要控制nodes数组即可]
     * @param  {[type]} NodeList [nodes数组]
     * @param  {[type]} sort     [当前的序号]
     * @param  {[type]} opened   [是否显示子节点]
     * @return {[type]}          [description]
     */
    function createDomTree(NodeList, sort, opened) {
      var html = $('<ul data-sort="' + sort + '""></ul>');
      if ((!sort && opened !== false) || opened) {
        html.addClass('show');
      }
      NodeList.forEach(function(node, i) {
        var nodeHtml = $('<li><span><i></i>' + node.text + '</span></li>');
        if (node.searched) {
          nodeHtml.addClass('searched');
        }
        nodeHtml.attr('data-sort', sort === undefined ? i : sort + '-' + i);

        if (isNodeOpen(node) || isRootNode(sort)) {
          nodeHtml.addClass('open');
        }

        if (isForceClosed(node)) {
          nodeHtml.removeClass('open').addClass('closed');
        }

        if (hasChildren(node)) {
          var childrenHtml = createDomTree(node.children, sort === undefined ? i : sort + '-' + i, node.open);
        } else {
          nodeHtml.addClass('no-children');
        }

        nodeHtml.append(childrenHtml);
        html.append(nodeHtml);
      });
      html.find('li.open').parents('li').not('.closed').addClass('open').find('>ul').addClass('show');
      html.find('li.searched').parents('li').addClass('open').find('>ul').addClass('show');
      return html;
    }
    /**
     * [updateTreeDom 根据当前的nodes数组，更新当前的dom]
     * @return {[type]} [description]
     */
    this.updateTreeDom = function() {
      var treeDOM = createDomTree.call(this, this.nodes);
      $(elem).empty().append(treeDOM);
    };


    /**
     * [selectNode 选中节点并发起回调]
     */
    this.selectNode = function($dom) {
      $dom = $dom.parent('li');
      this.choosedNode = $dom;
      if (typeof this.chooseNodeCallBack === 'function') {
        this.chooseNodeCallBack(this.choosedNode);
      }
    };
    /**
     * [点击事件]
     */
    $(elem).delegate('li', 'click', function(event) {
      var $this = $(event.target);
      if (event.target.tagName.toUpperCase() === 'I') {
        $this = $this.parents('li').first();
      } else {
        this.selectNode($this);
        return false;
      }
      if (!$this.length) {
        return false;
      }
      var sort = $this.attr('data-sort');
      sort = sort.split('-');
      var cache = this.getArrayDeep(this.nodes, sort);
      if (cache.open === undefined && option.opened) {
        cache.open = false;
      } else {
        cache.open = !cache.open;
      }
      this.updateTreeDom();
      event.stopPropagation();
    }.bind(this));

    this.updateTreeDom();
  };
  /**
   * [search 搜索节点]
   * @param  {[type]} str [搜索的字符串]
   */
  Tree.prototype.search = function(str) {
    if (str.length) {
      deepIteratorAndChangeProperty(this.nodes, str, { searched: true }, { searched: false });
    } else {
      deepIteratorAndChangeProperty(this.nodes, null, { searched: true }, { searched: false });
    }
    this.updateTreeDom();
  };

  Tree.prototype.clickNode = function(callBack) {
    this.chooseNodeCallBack = callBack;
  };
  /**
   * [removeSelectNode 删除节点]
   * @return {[type]} [description]
   */
  Tree.prototype.removeSelectNode = function() {
    if (!this.choosedNode || !this.choosedNode.length) {
      return {
        errMes: '请先选择需要删除的节点'
      };
    }
    var sort = this.choosedNode.attr('data-sort').split('-');
    var cache = this.getArrayDeep(this.nodes, sort.slice(0, sort.length - 1));
    cache.children.splice(sort[sort.length - 1], 1);
    this.updateTreeDom();
    return {
      errMes: false
    };
  };
  /**
   * [addNode 新增节点]
   * @param {[type]} option {
    addNodeWay: 0,//新增节点方式 0:新增子节点, 1:新增兄弟节点 默认值为0
    newNodeName: "new name"//新节点的名字
   }
   */
  Tree.prototype.addNode = function(option) {
    if (!this.choosedNode || !this.choosedNode.length) {
      console.error('请先选择一个节点');
      return {
        errMes: '请先选择一个节点'
      };
    }
    if (!option.newNodeName || !option.newNodeName.length) {
      console.error('节点名字不可以为空');
      return {
        errMes: '节点名字不可以为空'
      };
    }
    option.addNodeWay = parseInt(option.addNodeWay) || 0;
    var sort = this.choosedNode.attr('data-sort').split('-');
    var newNode = {
      text: option.newNodeName
    };
    //新增子节点
    if (option.addNodeWay === ADD_NODE_WAY.ADD_CHILD_NODE) {
      var cache = this.getArrayDeep(this.nodes, sort);
      cache.open = true;
      cache.children = cache.children || [];
      cache.children.push(newNode);
    } else if (option.addNodeWay === ADD_NODE_WAY.ADD_BROTHER_NODE) { //新增兄弟节点
      var cache = this.getArrayDeep(this.nodes, sort.slice(0, sort.length - 1));
      var index = parseInt(sort[sort.length - 1]) + 1;
      cache.children.splice(index, 0, newNode);
    }
    this.updateTreeDom();
    return {
      errMes: false
    };
  };
  window.Tree = Tree;
  return Tree;
});
