(function() {
	function login(appId) {
		return new Promise(function(resolve, reject) {
			FB.init({
				appId: appId,
				xfbml: true,
				version: 'v2.2'
			});

			FB.login(function(response) {
				if (response.authResponse) {
					resolve();
				} else {
					reject();
					return;
				}
			}, {
				scope: 'read_mailbox'
			});
		});
	}

	function listConversations() {
		return new Promise(function(resolve, reject) {
			var data = [];
			FB.api('/me/conversations?fields=message_count,participants', function cb(response) {
				if(response.data.length <= 0) {
					resolve(data);
					return;
				}
				Array.prototype.push.apply(data, response.data);
				FB.api(response.paging.next, cb);
			});
		});
	}

	function loadConversation(conv) {
		return new Promise(function(resolve, reject) {
			var thread = conv;
			thread.messages = [];
			FB.api('/'+conv.id+'/messages', function cb(response) {
				if(response.data.length <= 0) {
					resolve(thread);
					return;
				}
				Array.prototype.push.apply(thread.messages, response.data);
				FB.api(response.paging.next, cb);
			});
		});
	}

	function loadAttachments(conv) {
		conv.messages = conv.messages.map(function(msg) {
			if(!msg.attachments || msg.attachments.data.length <= 0) {
				return Promise.resolve(msg);
			}
			msg.attachments.data = msg.attachments.data.map(loadSingleAttachment);
			return Promise.all(msg.attachments.data)
			.then(x => {
				msg.attachments.data = x;
				return msg;
			});
		});
		return Promise.all(conv.messages)
		.then(x => {
			conv.messages = x;
			return conv;
		});
	}

	function loadSingleAttachment(at) {
		if(!at.mime_type.startsWith('image/')) {
			return Promise.resolve(at);
		}

		return new Promise(function(resolve, reject) {
			// TODO: Use XHR?
			resolve(at);
		});
	}

	function setStatus(msg, data) {
		var elem = document.querySelector('#status');
		elem.textContent = msg;
		if(this == true) {
			elem.textContent = elem.textContent + JSON.stringify(data);
		}
		return data;
	}

	document.querySelector('#login').onclick = function() {
		login(document.querySelector('#appid').value)
		.then(setStatus.bind(false, 'Loading conversation list'))
		.then(listConversations)
		.then(convList => convList.filter(x => x.message_count < 500).slice(0, 4))
		.then(setStatus.bind(false, 'Loading messages of conversations'))
		.then(convList => Promise.all(convList.map(loadConversation)))
		.then(setStatus.bind(false, 'Loading attachments of converstations'))
		.then(convList => Promise.all(convList.map(loadAttachments)))
		.then(setStatus.bind(false, 'Printing conversations'))
		.then(convList => console.log(convList))
		.catch(setStatus.bind(true, 'Something went wrong!'));
	};
})();
