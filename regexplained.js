// Remove spaces in syntax breakdown and add classes to the ones that are towards the end
$$('.syntax-breakdown h1 code').forEach(function(code){
	code.innerHTML = code.innerHTML
		.replace(/[\t\r\n]/g, '');
	
	var text = code.textContent;
	
	$$('span', code).forEach(function(span){
		span.classList.add('delayed');
		
		if(text.indexOf(span.textContent) > text.length/2) {
			// FIXME will break when there are duplicates
			span.classList.add('after-middle');
		}
	});
});

$$('.regex-test.slide').forEach(function(slide){
	slide.tester = new RegExpTester(slide);
});
