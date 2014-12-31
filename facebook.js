export function login(appId) {
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

export function listConversations() {
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

export function loadConversation(conv) {
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

export function loadAttachments(conv) {
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

export function loadSingleAttachment(at) {
	if(!at.mime_type.startsWith('image/')) {
		return Promise.resolve(at);
	}

	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState != 4) {
				return;
			}
			at.binary_data = StringView.bytesToBase64(new Uint8Array(xhr.response));
			resolve(at);
		};
		xhr.responseType = 'arraybuffer';
		xhr.open('GET', at.image_data.url, true);
		xhr.send();
	});
}

export function blobifyConversation(conv) {
	// TODO: Actual implementation...
	return Promise.resolve(conv.id);
}
