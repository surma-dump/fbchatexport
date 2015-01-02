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
			if(!response.data || response.data.length <= 0) {
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
			if(!response.data || response.data.length <= 0) {
				resolve(thread);
				return;
			}
			Array.prototype.push.apply(thread.messages, response.data);
			FB.api(response.paging.next, cb);
		});
	});
}

export function loadAttachments(conv) {
	return Promise.all(
		conv.messages.map(msg => {
			if(!msg.attachments || !msg.attachments.data || msg.attachments.data.length <= 0) {
				return Promise.resolve(msg);
			}

			return Promise.all(
				msg.attachments.data
				.map(x => (x.image_data || {}).url)
				.map(loadImage)
			)
			.then(attachments => {
				Object.keys(msg.attachments.data)
				.forEach(i => msg.attachments.data[i].binary_data = attachments[i]);
				return msg;
			});
		})
	)
	.then(x => {
		conv.messages = x;
		return conv;
	});
}

export function loadAvatars(conv) {
	return Promise.all(
		conv.participants.data
		.map(x => 'https://graph.facebook.com/'+x.id+'/picture?type=large&redirect=true')
		.map(loadImage)
	)
	.then(avatars => {
		Object.keys(conv.participants.data)
		.forEach(i => conv.participants.data[i].picture = avatars[i])
		return conv;
	});
}

function loadImage(url) {
	return new Promise(function(resolve, reject) {
		if(!url) {
			resolve('');
			return
		}
		var img = document.createElement('img');
		img.onload = function() {
			var cnv = document.createElement('canvas');
			cnv.width = img.width;
			cnv.height = img.height;
			cnv.getContext('2d').drawImage(img, 0, 0);
			resolve(cnv.toDataURL());
		};
		img.crossOrigin = 'anonymous';
		img.src = url;
	});
}

export function stringifyConversation(conv) {
	var msgs = conv.messages;
	conv.messages = [];

	var data = [JSON.stringify(conv)];
	Array.prototype.push.apply(data, msgs.map(JSON.stringify));

	return Promise.resolve({
		name: conv.id,
		data: data.join('')
	});
}
