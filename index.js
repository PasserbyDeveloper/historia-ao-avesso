import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

window["onModoComTempoClick"] = function(event) {
	event.preventDefault();
	startEditor(true);
	window['frontpage'].style.display = 'none';
	window.history.pushState(null, null, '/#modo-com-tempo');
}

window["onModoSemTempoClick"] = function(event) {
	event.preventDefault();
	startEditor(false);
	window['frontpage'].style.display = 'none';
	window.history.pushState(null, null, '/#modo-sem-tempo');
}

window.onpopstate = function() {
	if (window.location.pathname === '/') {
		window['frontpage'].style.display = 'flex';
		window['editor'].dispose();
	} else if (window.location.pathname.startsWith('/#modo-com-tempo')) {
		window['frontpage'].style.display = 'none';
		startEditor(true);
	} else {
		window['frontpage'].style.display = 'none';
		startEditor(false);
	}
}

function startEditor(isTimerBasedSession) {
	// create div to avoid needing a HtmlWebpackPlugin template
	const div = window['root'];
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


	window['editor'] = editor;

	window.addEventListener('resize', function() {
		if (window['editor']) {
			window['editor'].layout({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		window['div'].style = `width: ${window.innerWidth}px; height: ${window.innerHeight}px;`;
	});

	const line = Math.floor(numberOfLines * 0.7);
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

			editor.setSelection(new monaco.Range(line.lineNumber, 0, line.lineNumber, 1))
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

