'use strict';

import React from "react";
import ReactDOM from "react-dom";
import BaseComponent from "./base";
import CommentList from "./comment_list";
import CommentForm from "./comment_form";
import $ from "jquery";

class CommentBox extends BaseComponent {
  constructor (props) {
    super(props);
    this.state = {data: []};
    this._bind('loadCommentsFromServer', 'handleCommentSubmit', 'componentDidMount');
  }

  loadCommentsFromServer () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  handleCommentSubmit (comment) {
    const comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    const newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  componentDidMount () {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  }

  render () {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data}/>
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
}

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000}/>,
  document.getElementById('content')
);

module.exports = CommentBox;
