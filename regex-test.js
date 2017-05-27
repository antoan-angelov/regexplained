// Code for simple regex testers
(function(){

var _ = self.RegExpTester = function(container){
	var me = this;
	
	var patternAttr = getParameterByName('pattern') || container.getAttribute('data-pattern'),
	    initialPattern = RegExp(patternAttr || ''),
	    initialTest = getParameterByName('test') || container.getAttribute('data-test');
	
	this.pattern = RegExp(initialPattern.source); 
	this.flags = container.getAttribute('data-flags') || 'g';
	this.detailed = !container.hasAttribute('data-simple');
	this.matches = [];
	
	container.classList.add('regex-test');
	
	this.input = $u.element.create({
			tag: 'input',
			properties: {
				value: patternAttr,
				tabIndex: 1
			}
		});
	
	this.tester = $u.element.create({
		    	tag: 'input',
		    	properties: {
		    		value: initialTest,
		    		tabIndex: 2
		    	}
		    });
		    
	this.flagsContainer = $u.element.create('span', this.flags);
	    
	$u.element.contents(container, [{
			tag: 'div',
			properties: {
				className: 'pattern'
			},
			contents: ['/', {
				tag: 'div',
				contents: this.input
			}, '/', this.flagsContainer]
		}, {
			tag: 'br'
		}, {
			tag: 'div',
			properties: {
				className: 'tester' + (initialPattern.test(initialTest)? '' : ' invalid')
			},
	    	contents: ['"', {
	    		tag: 'div',
	    		contents: this.tester
	    	}, '"']
		}
	], 'start');
	
	this.setMatchIndicatorsDisplay = function(display) {
		for (var i = 0; i < this.matchIndicators.length; i++) {
			this.matchIndicators[i].style.display = display;
		}
	}

	this.setSubmatchIndicatorsDisplay = function(display) {
		for (var i = 0; i < this.submatchIndicators.length; i++) {
			this.submatchIndicators[i].style.display = display;
		}
	}

	this.setMatchIndicatorsDisplay.bind(this, 'none');
	this.setSubmatchIndicatorsDisplay.bind(this, 'none');	
	
	container.addEventListener('keydown', function(evt) {	
		if (evt.ctrlKey) {
			if (evt.keyCode === 73) { // I
				me.toggleFlag('i');
			}
			else if (evt.keyCode === 77) { // M
				me.toggleFlag('m');
			}
		}
	});
	
	$u.event.bind([this.input, this.tester], 'input', function(){
		var div = this.parentNode.parentNode;
		    
		div.style.fontSize = _.fontSize(this.value.length) + '%';

		this.style.width = _.getCh(this);
		
		me.test();
	});
	
	if(this.embedded = container.classList.contains('slide')) {
		addEventListener('hashchange', function(){
			if(container.id === location.hash.slice(1)) {
				$u.event.fire([me.input, me.tester], 'input');
			}
		});
		
		setTimeout(function(){
			$u.event.fire(window, 'hashchange');
		}, 0);
	}
	else {
		$u.event.fire([this.input, this.tester], 'input');
	}

	function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
};

_.supportsCh = (function() {
	var dummy = document.createElement('_');
	dummy.style.width = '1ch';
	return !!dummy.style.width;
})();

if(_.supportsCh) {
	_.getCh = function(input) { return (input.value.length || .2) + 'ch'; }
}
else {
	_.getCh = function(input) {
		var parent = input.parentNode, dummy;
		
		dummy = _.getCh.dummy || (_.getCh.dummy = document.createElement('_'));
		
		dummy.style.display = 'inline-block';
		
		if(dummy.parentNode !== parent) {
			parent.appendChild(dummy);
		}
		
		// Replace spaces with characters so they don't get collapsed
		dummy.textContent = input.value.replace(/ /g, 'a');
		
		var w = dummy.offsetWidth;
		
		dummy.style.display = 'none';

		input.ch = w/input.value.length;
		
		return w + 'px';
	}
}

_.fontSize = (function(){
	var sizes = [];
	
	sizes[9]  = 360;
	sizes[11] = 340;
	sizes[13] = 290;
	sizes[20] = 200;
	sizes[40] = 100;
	
	var lowerBound = 9;
	
	for(var i=0; i<9; i++) {
		sizes[i] = sizes[9];
	}
	
	for(var i=9; i<sizes.length; i++) {
		if(sizes[i] === undefined) {
			for(var j=i+1; sizes[j] === undefined; j++);
			
			var upperBound = j,
			    range = upperBound - lowerBound,
			    ratio = (i - lowerBound)/range;

			sizes[i] = sizes[lowerBound] - ratio * (sizes[lowerBound] - sizes[upperBound])
		}
		else {
			lowerBound = i;
		}
	}
	
	return function(length) {
		if(sizes[length]) {
			return sizes[length];
		}
		
		return sizes[sizes.length - 1];
	}
})();

_.prototype = {
	positionIndicator: function(indicator, index, length) {
		var ch = this.tester.ch || this.tester.offsetWidth / this.tester.value.length;
		
		indicator.style.left = ch * index + 'px';
		indicator.style.left = index + 'ch';
		indicator.style.width = ch * length + 'px';
		indicator.style.width = length + 'ch';
	},
	
	test: function() {
		if(!this.input.value) { return; }
		
		try {
			var pattern = this.pattern = RegExp(this.input.value, this.flags);
			this.input.parentNode.parentNode.classList.remove('invalid');
		}
		catch(e) {
			this.input.parentNode.parentNode.classList.add('invalid');
			return;
		}
		
		var test = this.testStr = this.tester.value.replace(/\\n/g, '\n').replace(/\\r/g, '\r'),
		    isMatch = pattern.test(test);
		
		this.tester.parentNode.parentNode.classList[isMatch? 'remove' : 'add']('invalid');
		
		this.matches = [];
		
		pattern.lastIndex = 0;

		if (isMatch) {
			// Show exact matches
			var match;
			
			while (match = pattern.exec(test)) {
				var matches = {
					index: match.index,
					length: match[0].length,
					subpatterns: match
				};

				this.matches.push(matches);
				
				if(matches.length === 0) {
					pattern.lastIndex++;
				}
			}
		}
		
		this.nextMatch();
	},
	
	toggleFlag: function (flag) {
		if (this.flags.indexOf(flag) > -1) {
			this.flags = this.flags.replace(RegExp(flag, 'g'), '');
		}
		else {
			this.flags += flag;
		}
		
		this.flagsContainer.textContent = this.flags;
		
		this.test();
	},
	
	gotoMatch: function () {
		if(!this.matches.length) { 
			this.setMatchIndicatorsDisplay.bind(this, 'none')
		}
		else {
			for (var i = 0; i < this.matches.length; i++) {
				var match = this.matches[i];
				if(match) {
					var before = this.testStr.substr(0, match.index + 1),
						lineBreaks = (before.match(/\n|\r/g) || []).length;
					this.positionIndicator(this.matchIndicators[i], match.index + lineBreaks, match.length);
				}
				else {
					throw Error('No match exists at ' + match.index);
				}
			}
			this.setMatchIndicatorsDisplay.bind(this, '')
		}
		
		this.nextSubpattern();
	},
	
	gotoSubpattern: function () {
		var handledSubmatchesCount = 0;
		for (var i = 0; i < this.matches.length; i++) {
			var match = this.matches[i];
			if (!match) {
				throw Error('No subpattern exists in pattern ' + i);
			}
			var subpatterns = match.subpatterns.slice() || [];
			if(!subpatterns.length) {
				this.setSubmatchIndicatorsDisplay.bind(this, 'none'); 
			}
			else {
				for (var j = 0; j < subpatterns.length; j++) {
					var subpattern = subpatterns[j];
					var strIndex = match.subpatterns[0].indexOf(subpattern);
					
					if (strIndex === -1) {
						strIndex = match.subpatterns.input.indexOf(subpattern, match.index) - 1;
					}
					
					var offset = match.index + strIndex;
					
					var before = this.testStr.substr(0, offset + 1),
						lineBreaks = (before.match(/\n|\r/g) || []).length;
						
					// We store the subpatterns in a 1D array, here we have to add an offset to get the proper index.
					this.positionIndicator(this.submatchIndicators[j + handledSubmatchesCount], offset + lineBreaks, subpattern.length);
					this.setSubmatchIndicatorsDisplay.bind(this, '');
				}
				handledSubmatchesCount += subpatterns.length;
			}
		}
	},
	
	nextMatch: function () {		
		if (this.matchIndicators) {
			this.matchIndicators.forEach(function(el) {
				el.parentNode.removeChild(el);
			});
		}

		this.matchIndicators = [];

		for (var i = 0; i < this.matches.length; i++) {
			this.matchIndicators.push($u.element.create('div', {
				properties: {
					className: 'match indicator'
				},
				inside: this.tester.parentNode
			}));
		}

		this.gotoMatch();
	},
	
	nextSubpattern: function () {
		if (this.submatchIndicators) {
			this.submatchIndicators.forEach(function(el) {
				el.parentNode.removeChild(el);
			});
		}

		this.submatchIndicators = []

		for (var i = 0; i < this.matches.length; i++) {
			var match = this.matches[i];
			var subpatterns = match.subpatterns.slice() || [];
			for (var j = 0; j < subpatterns.length; j++) {
				this.submatchIndicators.push($u.element.create('div', {
					properties: {
						className: 'sub match indicator'
					},
					inside: this.tester.parentNode
				}));
			}
		}
		this.gotoSubpattern();
	}
};

})();
