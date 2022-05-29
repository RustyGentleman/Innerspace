// --- Pretty console logs ---
const logcss = `font-family: Hack, monospace;text-shadow: 0 0 10px black, 0 0 10px black;background: linear-gradient(to right, #4d94ff 0%, #4d94ff 8px, rgb(77 148 255 / 30%) 8px, transparent 50px);color: #4d94ff;padding: 2px 0 2px 30px;`
const warncss = `font-family: Hack, monospace;text-shadow: 0 0 10px black, 0 0 10px black;background: linear-gradient(to right, #ffa621 0%, #ffa621 0% 8px, rgb(255 166 33 / 30%) 8px, transparent 50px);color: #ffa621;padding: 2px 0 2px 30px;`
const log = (e) => console.log('%c'+e, logcss)
const warn = (e) => console.log('%c'+e, warncss)
// --- Just some useful shorthands, idk ---
const abs = Math.abs
const testGrass = false
// --- Important variables ---
const step = 4
const bubble_fadetime = 300
// --- Classes/Objects ---
function NPC(name='NPC', color, interactable=true){
	this.name = name
	this.color = color
	this.element = (interactable) ? $('<div class="npc" data-interactable>') : $('<div class="npc">')
	this.has_bubble = false
	this.coord
	this.pos
	this.state = 0
	this.element.attr('data-name', name)
	this.element.css('filter', `hue-rotate(${color}deg)`)
	this.bubble = function(){
		if (!this.has_bubble){
			$(this.element).append($('<div class="bubble">'))
			this.has_bubble = true
		}
		return $(this.element[0].querySelector('.bubble'))
	}
	this.removeBubble = function(){
		$(this.element[0].querySelector('.bubble')).fadeOut(bubble_fadetime)
		this.element[0].innerHTML = ''
		this.has_bubble = false
	}
	this.addSpeech = function(text){
		let spans = []
		for (i=0; i<text.length; i++)
			spans[i] = $(`<span style="animation-delay:${i}00ms">${(text[i] == ' ') ? '\xa0' : text[i]}</span>`)[0]

		this.bubble()
				.append(
					$('<span class="speech">')
						.append(spans)
				)
				.append($('<br>'))
	}
	this.setSpeech = function(text){
		this.removeBubble()
		this.bubble()
			.append(
				$('<span class="name">')
					.text(this.name)
			)
			.append($('<br>'))
		this.addSpeech(text)
		this.bubble().fadeOut(0).fadeIn(bubble_fadetime)
		return this
	}
	this.addElement = function(element){
		this.bubble().append(element)
	}
}
// --- Quick-access variables ---
let $player = $('.player')
let $field = $('#field')
let player
let field
// --- Runtime variables ---
let ppos = {x:0, y:0}
let move = {can:true, left:false, up:false, right:false, down:false, sprint:false}
let npcs = []
let visited = []
visited[0] = {x:0,y:0}
// --- NPCs ---
const Dolly = new NPC('Dolly', 344, true)
Dolly.interact = function(){
	this.state++
	if (this.state == 1)
		this.setSpeech('What...')
	else if (this.state == 2){
		this.setSpeech('Who are you?')
		// this.addElement(
		// 	$('<input type="text" size="1">')
		// 		.on('focus', () => {
		// 			// move.can = false
		// 			log('Damnit')
		// 		})
		// 		.on('blur', () => {
		// 			// move.can = true
		// 			log('Damnit')
		// 		}))
	}
}
Dolly.onGenerate = function() {setTimeout(() => {this.interact()}, 1000)}
// ----<=>---- NPCs ----<=>----
$(document).ready(function(){
	log('Ready')
	move.can = true
	UpdateVariables()
	GenerateGrass()
	$(window).keydown((e) => {
		switch (e.which){
			case 37:
			case 65:
				move.left = true
				break
			case 39:
			case 68:
				move.right = true
				break
			case 38:
			case 87:
				move.up = true
				break
			case 40:
			case 83:
				move.down = true
				break
			case 16:
				move.sprint = true
				break
		}
		// log(e.which)
	})
	$(window).keyup((e) => {
		switch (e.which){
			case 37:
			case 65:
				move.left = false
				break
			case 39:
			case 68:
				move.right = false
				break
			case 38:
			case 87:
				move.up = false
				break
			case 40:
			case 83:
				move.down = false
				break
			case 16:
				move.sprint = false
				break
			case 69:
				Interact()
				break
		}
	})
	setInterval(GameLoop, 32)
	let grassTest
	if (testGrass) grassTest = setInterval(() => GenerateGrass(false, 1000*Math.random()), 100)
})

// --- Game functions ---
function GameLoop() {
	if (!document.hasFocus())
		Object.keys(move).forEach(k => {
			if (k != 'can')
				move[k] = false
		})
	DoMovement()
	DoBoundaryCheck()
	if (visited.length == 3 && !$('.npc[data-name=Dolly]')[0]) {
		GenerateNPC('Dolly', 344)
	}
}
function UpdateVariables(){
	$player = $('.player')
	$field = $('#field')
	player = $player[0]
	field = $field[0]
}
function DoMovement(){
	if (move.left)		Move('left')
	if (move.right)	Move('right')
	if (move.up)		Move('up')
	if (move.down)		Move('down')

	function Move(dir){
		if (move.can == false) return
		let stepsize_vmin = step
		let stepsize_px = vmin(step)
		let diagonal_adjust = 0.7
		if (move.sprint) stepsize_px *= 1.3
		switch(dir){
			case 'left':
				if ((move.up || move.down) && !(move.up && move.down))
					stepsize_vmin *= diagonal_adjust
				$player.css('left',`calc(50% + ${ppos.x-=stepsize_vmin}vmin)`)
				break
			case 'right':
				if ((move.up || move.down) && !(move.up && move.down))
					stepsize_vmin *= diagonal_adjust
				$player.css('left',`calc(50% + ${ppos.x+=stepsize_vmin}vmin)`)
				break
			case 'up':
				if ((move.left || move.right) && !(move.left && move.right))
					stepsize_vmin *= diagonal_adjust
				$player.css('top',`calc(50% + ${ppos.y-=stepsize_vmin}vmin)`)
				break
			case 'down':
				if ((move.left || move.right) && !(move.left && move.right))
					stepsize_vmin *= diagonal_adjust
				$player.css('top',`calc(50% + ${ppos.y+=stepsize_vmin}vmin)`)
				break
		}
	}
}
function DoBoundaryCheck(){
	if (!(
		ppos.y + 100 / 2 <= 0
		|| ppos.x + 100 / 2 <= 0
		|| ppos.y >= 100 / 2
		|| ppos.x >= 100 / 2
	)) return
	$('.npc').remove()
	if (ppos.y + 100 / 2 <= 0) {
		// log('1 ppos.y + 100 / 2 <= 0')
		$player.remove()
		$field.attr('data-y', parseInt($field.attr('data-y')) + 1)
			.append($('<div class="player">')
				.css('top', `calc(50% + ${ppos.y += 100}vmin)`)
				.css('left', `calc(50% + ${ppos.x}vmin)`)
			)
	}
	if (ppos.x + 100 / 2 <= 0) {
		// log('2 ppos.x + 100 / 2 <= 0')
		$player.remove()
		$field.attr('data-x', parseInt($field.attr('data-x')) - 1)
			.append($('<div class="player">')
				.css('left', `calc(50% + ${ppos.x += 100}vmin)`)
				.css('top', `calc(50% + ${ppos.y}vmin)`)
			)
	}
	if (ppos.y >= 100 / 2) {
		// log('3 ppos.y >= 100 / 2')
		$player.remove()
		$field.attr('data-y', parseInt($field.attr('data-y')) - 1)
			.append($('<div class="player">')
				.css('top', `calc(50% + ${ppos.y -= 100}vmin)`)
				.css('left', `calc(50% + ${ppos.x}vmin)`)
			)
	}
	if (ppos.x >= 100 / 2) {
		// log('4 ppos.x >= 100 / 2')
		$player.remove()
		$field.attr('data-x', parseInt($field.attr('data-x')) + 1)
			.append($(`<div class="player">`)
				.css('left', `calc(50% + ${ppos.x -= 100}vmin)`)
				.css('top', `calc(50% + ${ppos.y}vmin)`)
			)
	}
	UpdateVariables()
	GenerateGrass()
	AddToVisitedTiles()
	PopulateNPCs()

	function AddToVisitedTiles() {
		let already_visited = false
		visited.forEach(e => {
			if (e.x == parseInt(field.dataset.x) && e.y == parseInt(field.dataset.y))
				already_visited = true
		})
		if (!already_visited)
			visited[visited.length] = { x: parseInt(field.dataset.x), y: parseInt(field.dataset.y) }
	}
	function PopulateNPCs(){
		npcs.forEach(e => {
			if (e.coord.x == parseInt(field.dataset.x)
				&& e.coord.y == parseInt(field.dataset.y)
				){
				GenerateNPC(e.name, e.color)
			}
		})
	}
}
function Interact(){
	log('Interacting...')
	Array.from(document.querySelectorAll('[data-interactable]')).forEach(e => {
		let npc
		npcs.forEach(n => {
			if (n.name == e.dataset.name) npc = n
		})
		if (distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y) <= 20)
			npc.interact()
	})
}
// --- Graphic functions ---
function GenerateGrass(remove=true, seed_offset=0){
	if (remove) $('.grass').remove()
	let quantity = 10 + (ChaosHash(field.dataset.x, field.dataset.y, 21+seed_offset).x % 6 - 2)
	//log(`Generating ${quantity} grass`)
	for (i=0; i<quantity; i++){
		let pos = RandFromPos(field.dataset.x, field.dataset.y, 17+i+seed_offset)
		let grass = $('<img class="grass">')
		let type = parseInt((pos.x + pos.y) % 4)
		grass.attr('type',type)
		if (type == 3)
			grass.css('filter',`hue-rotate(${((pos.x*pos.y) % (360-100)) + 100}deg)`)
		pos.x = (pos.x - 50) * 0.8
		pos.y = (pos.y - 50) * 0.8
		grass.css('top', `calc(50% + calc(5vmin + ${pos.x}vmin)`)
			.css('left', `calc(50% + calc(5vmin + ${pos.y}vmin)`)
			.attr('src', `assets/grass${type}.png`)
		$field.append(grass)
	}
}
function GenerateNPC(name='NPC', color=160){
	// If NPC is already on screen
	if ($(`.npc[data-name="${name}"]`)[0]) return null
	// If NPC has already been generated, but does not belong here
	let should_npc_be_here = true
	npcs.forEach(e => {
		if (e.name == name
			&& e.coord.x != parseInt(field.dataset.x)
			|| e.coord.y != parseInt(field.dataset.y))
			should_npc_be_here = false
			return
	})
	if (!should_npc_be_here) return null
	//log(`Generating NPC: ${name} at ${field.dataset.x},${field.dataset.y}`)
	// If NPC has already been generated
	let npc_already_exists = false
	npcs.forEach(e => {
		if (e.name == name
			&& e.coord.x == parseInt(field.dataset.x)
			&& e.coord.y == parseInt(field.dataset.y))
			npc_already_exists = e
			$field.append(e.element)
	})
	if (npc_already_exists) return null
	// If NPC has not been generated
	let npc
	if (name == 'Dolly') npc = Dolly
	else npc = new NPC(name, color)
	npcs[npcs.length] = npc
	npc.coord = {x:parseInt(field.dataset.x),y:parseInt(field.dataset.y)}
	let ch = ChaosHash(color*32, color*color+15, 57)
	npc.pos = {x:(ch.x%80)-40,y:(ch.y%80)-40}
	$(npc.element).css('left', `calc(50% + ${npc.pos.x}vmin)`)
						.css('top', `calc(50% + ${npc.pos.y}vmin)`)
	$field.append(npc.element)
	if (npc.onGenerate) npc.onGenerate()
	return npc
}
// --- Generator functions ---
function ChaosHash(inx, iny, offset=0){
	let seed = 3332 + offset
	let outx = seed + inx * 374761393
	let outy = seed + iny * 668265263
	outx = (outx^(outx >> 13)) * 1274126177
	outy = (outy^(outy >> 29)) * 1274126177
	return {x:outx^(outx >> 7), y:outy^(outy >> 11)}
}
function RandFromPos(x, y, off){
	let out = ChaosHash(x, y, off)
	return {x:parseInt(out.x % 100), y:parseInt(out.y % 100)}
}
// --- Assistive functions ---
function vh(v) {
	return (v * (Math.max(document.documentElement.clientHeight, window.innerHeight || 0))) / 100
}
function vw(v) {
	return (v * (Math.max(document.documentElement.clientWidth, window.innerWidth || 0))) / 100
}
function vmin(v) {return Math.min(vh(v), vw(v));}
function distance_between(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}