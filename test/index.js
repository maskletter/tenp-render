

const { expect } = require('chai')
require('mocha');
const { render, compile, template, htmltoJsonTree, expressRender, updateConfig } = require('../lib/render.js');


describe('updateConfig', function(){
	it('设置模板默认目录', function(){
		updateConfig('templateUrl', 'test/template')
	})
})

describe('htmltoJsonTree', function(){

	it('创建单元素', function(){
	    const treeList = htmltoJsonTree('<div>');
	    expect(treeList).to.be.deep.equal([
	    	{ name: 'div', attr: {}, children: [] }
	    ])
	});


	it('创建多元素', function(){
	    const treeList = htmltoJsonTree('<div></div><h1></h1>');
	    expect(treeList).to.be.deep.equal([
	    	{ name: 'div', attr: {}, children: [] },
  			{ name: 'h1', attr: {}, children: [] }
	    ])
	});

	it('带有子元素', function(){
	    const treeList = htmltoJsonTree('<div>Hello</div><h1>World</h1>');
	    expect(treeList).to.be.deep.equal([
	    	{ name: 'div', attr: {}, children: [ { name: 'text', content: 'Hello' } ] },
  			{ name: 'h1', attr: {}, children: [ { name: 'text', content: 'World' } ] }
	    ])
	});

	it('获取元素的attr', function(){
	    const treeList = htmltoJsonTree('<div id="container" class="box"></div>');
	    expect(treeList[0].attr).to.be.deep.equal({
	    	id: 'container',
	    	class: 'box'
	    })
	});

})


describe('template', function(){

	it('创建虚拟模板', function(){
	    const htmlStr = template('template/index.are', '<div></div>');
	});

	it('创建模板', function(){
	    const htmlStr = template('hello.html');
	});


	// it('创建模板', function(){
	//     const treeList = template('hello.html');
	//     expect(render(treeList)).to.have.string('<!DOCTYPE html><html lang="en" ><head ><meta charset="UTF-8" ></meta><title >Document</title></head><body ><p >aaaaaaaa</p></body></html>')
	// });


})


describe('*for/*if/[attr]', function(){

	it('{{数值}}', function(){
	    const htmlStr = render('hello.html', { name: '张三' });
	    expect(htmlStr).to.have.string('<!DOCTYPE html><html lang="en" ><head ><meta charset="UTF-8" ></meta><title >Document</title></head><body ><p >张三:aaaaaaaa</p></body></html>')
	});


	it('*for', function(){
	    const htmlFunStr = template('test-template1', `<h1 *for='item in list;let $index'>{{$index}}:{{item}}</h1>`)
	    const html = compile(htmlFunStr, { list: [ '张三', '李四' ] });
	    expect(html).to.have.string('<!DOCTYPE html><h1 >0:张三</h1><h1 >1:李四</h1>')
	});


	it('*if/else', function(){
	    const htmlFunStr = template('test-template2', `
			<h1 *if='name == 1'>这是第一个</h1>
			<h1 *elseif='name == 2'>这是第二个</h1>
			<h1 *elseif='name == 3'>这是第三个</h1>
	    `)
	    const html = compile(htmlFunStr, { name: 3 });
	    expect(html).to.have.string('<!DOCTYPE html><h1 >这是第三个</h1>')
	});


	it('[attr]', function(){
	    const htmlFunStr = template('test-template3', `<h1 [status]='status'>状态:{{status}}</h1>`)
	    const html = compile(htmlFunStr, { status: 3 });
	    expect(html).to.have.string('<!DOCTYPE html><h1 status="3" >状态:3</h1>')
	});


	it('*for/*if/[attr]', function(){
	    const htmlFunStr = template('test-template4', `
			<h1 *for='item in list;let $index' *if='$index == 1' [name]='$index' [class]="item +' box'">{{$index}}:{{item}}</h1>
	    `)
	    const html = compile(htmlFunStr, { list: [ 'tom', 'job' ] });
	    expect(html).to.have.string('<!DOCTYPE html><h1 name="1" class="job box" >1:job</h1>')
	});

})