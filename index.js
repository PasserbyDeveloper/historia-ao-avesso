import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const prefixEndpoint = (window.location.hostname !== 'localhost') ? '/historia-ao-avesso' : '';

window.onModoComTempoClick = function(event) {
	event.preventDefault();
	window.history.pushState(null, null, prefixEndpoint + '/#modo-com-tempo');
	window.onPageStart();
}

window.onModoSemTempoClick = function(event) {
	event.preventDefault();
	window.history.pushState(null, null, prefixEndpoint + '/#modo-sem-tempo');
	window.onPageStart();
}

window.onAjudaClick = function(event) {
	event.preventDefault();
	window.history.pushState(null, null, prefixEndpoint + '/#ajuda');
	window.onPageStart();
}


window.onpopstate = function() {
	window.onPageStart();
}

window.onPageStart = function() {
	const url = window.location.href.substring(window.location.href.indexOf('/', 8));
	window.modalwrapper.style.display = 'none';
	document.querySelector('button.share-button').style.display = 'none';
	if (url === '/historia-ao-avesso/' || url === '/') {
		window.frontpage.style.display = 'flex';
		if (window.editor) {
			window.editor.dispose();
		}
		window.help.style.display = 'none';
		window.dangerzone.style.display = 'none';
		window.gameoverscreen.style.display = 'none';
	} else if (url.startsWith(prefixEndpoint + '/#modo-com-tempo')) {
		window.startEditor(true, false);
		window.frontpage.style.display = 'none';
		window.dangerzone.style.display = 'none';
		window.gameoverscreen.style.display = 'none';
		setTimeout(window.startDangerZone, 500);
		window.help.style.display = 'none';
	} else if (url.startsWith(prefixEndpoint + '/#modo-sem-tempo')) {
		window.frontpage.style.display = 'none';
		window.help.style.display = 'none';
		window.dangerzone.style.display = 'none';
		window.gameoverscreen.style.display = 'none';
		window.startEditor(false, false);
	} else if (url.startsWith(prefixEndpoint + '/#ajuda')) {
		window.frontpage.style.display = 'none';
		if (window.editor) {
			window.editor.dispose();
		}
		window.dangerzone.style.display = 'none';
		window.gameoverscreen.style.display = 'none';
		window.help.style.display = 'flex';
	} else if (url.startsWith(prefixEndpoint + '/#share-')) {
		window.frontpage.style.display = 'none';
		window.help.style.display = 'none';
		window.dangerzone.style.display = 'none';
		window.gameoverscreen.style.display = 'none';
		const encodedText = url.substring(url.indexOf('/#share-') + 8);
		const text = decodeURIComponent(encodedText);
		window.startEditor(false, true);
		setTimeout(() => {window.editor.setValue(text)}, 300);
	}
}

window.isDangerZoneActive = false;
let dangerZonePresentationElement = null;
window.dangerZoneState = {
	name: 'reset'
};
window.onDangerZoneUpdate = function(timeNowMs) {
	if (window.isDangerZoneActive === false) {
		return;
	}
	if (!dangerZonePresentationElement) {
		dangerZonePresentationElement = document.querySelector(`div.view-lines[role="presentation"]`);
		if (!dangerZonePresentationElement) {
			console.error('Danger zone line wrapper (presentation) not found');
			requestAnimationFrame(window.onDangerZoneUpdate);
			return;
		}
	}


	const currentLineCount = window.editor.getValue().split('\n').length;

	if (editor.getScrollTop() != 0 && window.dangerZoneState.name !== 'finished') {
		editor.setScrollTop(0);
	}
	const lineNumber = window.editor.getPosition().lineNumber;

	if (window.dangerZoneState.name === 'reset') {
		window.dangerZoneState.lastLineCount = currentLineCount;
		window.dangerZoneState.name = 'waiting-first-enter';
	} else if (window.dangerZoneState.name === 'waiting-first-enter') {
		if (currentLineCount > window.dangerZoneState.lastLineCount) {

			const lineElement = dangerZonePresentationElement.children[lineNumber];
			if (!lineElement) {
				console.error('Line element not found');
				requestAnimationFrame(window.onDangerZoneUpdate);
				return;
			}
			const lineElementTop = lineElement.getBoundingClientRect().y;

			window.dangerZoneState.startY = lineElementTop;
			window.dangerZoneState.startedAt = timeNowMs;
			window.dangerZoneState.currentLineStartedAt = timeNowMs;
			window.dangerZoneState.name = 'rising-danger-zone';
			window.dangerZoneState.position = (window.innerHeight * 0.99);
			const targetY = window.editor.getTopForLineNumber(lineNumber+1);
			window.dangerZoneState.positionLimit = targetY;
			const distance = targetY - window.dangerZoneState.position;
			window.dangerZoneState.velocity = distance / 10;
			window.dangerzone.style.display = 'block';
			window.dangerzone.style.top = window.dangerZoneState.position.toString() + 'px';
			window.dangerZoneState.lastFrameTime = timeNowMs;
			window.dangerZoneState.lastLineCount = currentLineCount;
		}
	} else if (window.dangerZoneState.name === 'rising-danger-zone') {
		const timeSinceLastFrame = (timeNowMs - window.dangerZoneState.lastFrameTime) / 1000;
		window.dangerZoneState.lastFrameTime = timeNowMs;
		if (currentLineCount > window.dangerZoneState.lastLineCount) {
			window.dangerZoneState.lastLineCount = currentLineCount;
			window.dangerZoneState.currentLineStartedAt = timeNowMs;
 			const lineHeight = window.editor.getTopForLineNumber(2) - window.editor.getTopForLineNumber(1);
			window.dangerZoneState.position += lineHeight;
		}

		window.dangerZoneState.position += timeSinceLastFrame * window.dangerZoneState.velocity;
		window.dangerzone.style.top = window.dangerZoneState.position.toString() + 'px';

		const nextLineTop = window.editor.getTopForLineNumber(lineNumber + 1);
		if (window.dangerZoneState.position < nextLineTop) {
			window.editor.updateOptions({ readOnly: true });
			window.dangerZoneState.name = 'finished';
			window.dangerzone.style.display = 'none';
			showGameOverScreen();
		}
	} else if (window.dangerZoneState.name === 'finished') {
		// Stop the loop
		window.isDangerZoneActive = false;
		return;
	}

	requestAnimationFrame(window.onDangerZoneUpdate);
}

window.onCompartilharClick = function(event) {
	event.preventDefault();
	window.modalwrapper.style.display = 'flex';
	const input = window.modalwrapper.querySelector('input');
	const base64 = window.editor.getValue();
	input.value = window.location.origin + window.location.pathname + '#share-' + encodeURIComponent(base64);
}

// event listener to remove modal on ESC
window.addEventListener('keydown', (event) => {
	if (event.code === 'Escape') {
		window.modalwrapper.style.display = 'none';
	}
});

window.showShareButton = function(isInstant) {
	const share = document.querySelector('button.share-button');
	share.style.display = '';
	share.style.opacity = '0';
	share.style.transform = 'translate(0, -60px)';
	setTimeout(() => {
		share.style.opacity = '1';
		share.style.transform = 'translate(0, 0px)';
	}, isInstant ? 0 : 2500);
}

function showGameOverScreen() {
	window.gameoverscreen.style.display = 'flex';
	const title = window.gameoverscreen.querySelector('h1');
	window.showShareButton(false);
	title.style.opacity = '0';
	title.style.transform = 'translate(0, 20px)';
	setTimeout(() => {
		title.style.opacity = '1';
		title.style.transform = 'translate(0, -20px)';
	}, 50);
	setTimeout(() => {
		title.style.opacity = '0';
		title.style.transform = 'translate(0, -80px)';
	}, 1500);

	// confetti implementation
	const confettiList = [];
	const options = ['🎉', '✨', '🎇'];
	for (let i = 0; i < 100; i++) {
		const div = document.createElement('div');
		div.innerText = options[Math.floor(Math.random() * options.length)];
		div.style.color = 'white';
		div.style.position = 'fixed';
		div.style.left = '0px';
		div.style.top = '0px';
		div.style.fontSize = '2rem';
		div.style.zIndex = '999';
		document.body.appendChild(div);
		const startedAtLeft = Math.random() > 0.5;
		confettiList.push({
			x: startedAtLeft ? -(Math.random()*50) : window.innerWidth + (Math.random()*50),
			y: window.innerHeight * 0.75,
			vx: (startedAtLeft ? 1 : -1) * (4 + Math.random() * 20),
			vy: -5 - Math.random() * 20,
			element: div,
		});
	}

	let frame = 0;
	function animateConfetti() {
		frame++;
		for (let confetti of confettiList) {
			confetti.vx *= 0.99;
			confetti.vy += 0.5;
			confetti.x += confetti.vx;
			confetti.y += confetti.vy;
			confetti.element.style.transform = 'translate(' + confetti.x.toString() + 'px, ' + confetti.y.toString() + 'px)';
		}
		if (frame < 120) {
			requestAnimationFrame(animateConfetti);
		} else {
			for (let confetti of confettiList) {
				confetti.element.remove();
			}
		}
	}
	requestAnimationFrame(animateConfetti);
}

window.startDangerZone = function () {
	isDangerZoneActive = true;
	dangerZoneState.name = 'reset';
	requestAnimationFrame(window.onDangerZoneUpdate);
}

onPageStart();

window.startEditor = function(isTimerBasedSession, shouldShowShareButton) {
	if (!isTimerBasedSession && shouldShowShareButton) {
		window.showShareButton(true);
	}
	const div = window.root;
	div.style = `width: ${window.innerWidth}px; height: ${window.innerHeight}px;`;

	document.body.appendChild(div);

	let numberOfLines = Math.floor(window.innerHeight / (40 + 14));
	const editor = monaco.editor.create(document.getElementById('root'), {
		value: `\n`.repeat(numberOfLines - 1),
		language: 'plaintext',
		theme: 'vs-dark',
		fontSize: 40,
		minimap: {
			enabled: false,
		},
		wordWrap: 'on',
		quickSuggestions: { other: false, comments: false, strings: false },
		acceptSuggestionOnEnter: "off",
		quickSuggestionsDelay: 10,
		wordBasedSuggestions: false,
	});

	window.editor = editor;

	window.addEventListener('resize', function() {
		if (window.editor) {
			window.editor.layout({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		window.root.style = `width: ${window.innerWidth}px; height: ${window.innerHeight}px;`;
	});

	const line = Math.floor(numberOfLines * 0.5);
	editor.setSelection(new monaco.Range(line, 0, line, 1));
	editor.focus();

	editor.addCommand(
		monaco.KeyCode.Enter | monaco.KeyMod.Shift,
		function (ctx) {
			const line = editor.getPosition();
			const range = new monaco.Range(line.lineNumber, 1, line.lineNumber, 1);
			const id = { major: 1, minor: 1 };
			const text = "\n\n";
			const op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
			editor.executeEdits("my-source", [op]);

			editor.setSelection(new monaco.Range(line.lineNumber, 0, line.lineNumber, 1));
		}
	);

	editor.addCommand(
		monaco.KeyCode.Enter,
		function (ctx) {
			const line = editor.getPosition();
			const range = new monaco.Range(line.lineNumber, 1, line.lineNumber, 1);
			const id = { major: 1, minor: 1 };
			const text = "\n";
			const op = {identifier: id, range: range, text: text, forceMoveMarkers: true};
			editor.executeEdits("my-source", [op]);

			editor.setSelection(new monaco.Range(line.lineNumber, 0, line.lineNumber, 1))
		}
	);

};

