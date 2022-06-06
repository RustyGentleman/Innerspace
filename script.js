// -------------------------------------------- //
// ?---------------- Preamble ----------------- //
// -------------------------------------------- //
// ?----------- Pretty console logs ----------- //
const logcss = `font-family: 'JetBrains Mono', monospace;text-shadow: 0 0 10px black, 0 0 10px black;background: linear-gradient(to right, #4d94ff 0%, #4d94ff 8px, rgb(77 148 255 / 30%) 8px, transparent 50px);color: #4d94ff;padding: 2px 0 2px 30px;`
const warncss = `font-family: 'JetBrains Mono', monospace;text-shadow: 0 0 10px black, 0 0 10px black;background: linear-gradient(to right, #ffa621 0%, #ffa621 0% 8px, rgb(255 166 33 / 30%) 8px, transparent 50px);color: #ffa621;padding: 2px 0 2px 30px;`
const log = (e) => {
	if (typeof(e) == 'object')
		console.log(e)
	else
		console.log('%c'+e, logcss)
}
const warn = (e) => {
	if (typeof(e) == 'object')
		console.log(e)
	else
		console.log('%c'+e, warncss)
}

// -------------------------------------------- //
// -------------------------------------------- //
// ?--------- Variables and Constants --------- //
// -------------------------------------------- //
// ?---- Just some useful shorthands, idk ----- //
const abs = Math.abs
const save = (property, value) => localStorage.setItem(`Emptiness.${property}`, value)
const get = (property) => localStorage.getItem(`Emptiness.${property}`)
const testGrass = false

// ?----------- Important variables ----------- //
const step = 4
const delay_bubblefade = 300
const delay_options = 700
const text_reveal = false
// ?--------- Quick-access variables ---------- //
let $player = $('.player')
let $field = $('#field')
let player
let field

// ?------------ Runtime variables ------------ //
let ppos = {x:0, y:0}
let move = {can:true, left:false, up:false, right:false, down:false, sprint:false}
let npcs = []
let visited = []
visited[0] = {x:0,y:0}

// ?------------- Classes/Objects ------------- //
function NPC(name='NPC', color, interactable=true){
	this.name = name
	this.color = color
	this.element = (interactable) ? $('<div class="npc" data-interactable>') : $('<div class="npc">')
	this.has_bubble = false
	this.coord
	this.pos
	this.states = {}
	this.interactions = {}
	this.block_interaction = false
	this.element.attr('data-name', name)
	this.element.css('filter', `hue-rotate(${color}deg)`)
	this.save = () => save(this.name, JSON.stringify(Dolly))
	this.bubble = function(){
		if (!this.has_bubble){
			let boob = $('<div>')
				.addClass('bubble')
				.css('filter', `hue-rotate(${360-color}deg)`)
			$(this.element).append(boob)
			if ((this.element[0].getBoundingClientRect().x - window.innerWidth/2) <= 0)
				boob.addClass('to-right')
			else boob.addClass('to-left')
			this.has_bubble = true
		}
		return $(this.element[0].querySelector('.bubble'))
	}
	this.bubble_remove = function(){
		$(this.element[0].querySelector('.bubble')).fadeOut(delay_bubblefade)
		this.element[0].innerHTML = ''
		this.has_bubble = false
	}
	this.bubble_reset = function(){
		this.bubble_remove()
		this.bubble()
			.append(
				$(`<span class="name" style="color:hsl(${color}, 100%, 50%">`)
					.text(this.name)
			)
			.append($('<br>'))
			.fadeOut(0).fadeIn(delay_bubblefade)
		return this
	}
	this.add_speech = function(text, newline=true){
		if (newline){
			let speech = $('<span class="speech">')
				.append(text_wavify(text_encode(text)))
			this.bubble().append(speech)
				speech.append($('<br>'))
			return speech
		}else{
			$(this.element[0].querySelectorAll('.speech')).last().append(text_wavify(text_encode(text)))
			return $(this.element[0].querySelectorAll('.speech'))
		}
	}
	this.set_speech = function(text, newline=true){
		this.bubble_remove()
		this.bubble()
			.append(
				$(`<span class="name" style="color:hsl(${color}, 100%, 50%">`)
					.text(this.name)
			)
			.append($('<br>'))
		if (newline)
			this.add_speech(text)
		else{
			this.add_speech('')[0].innerHTML = ''
			this.add_speech(text, newline)
		}
		this.bubble().fadeOut(0).fadeIn(delay_bubblefade)
		return this
	}
	this.add_element = function(element){
		this.bubble().append(element)
		return this
	}
	this.add_dialogueOption = async function(text, callback=null){
		await new Promise(r => setTimeout(r, delay_options))
		let option = $(`<span class="dialogue-option">${text}</span>`)
			.fadeOut(0)
		this.bubble().append(option)
		option.click(callback)
			.fadeIn(delay_options)
		return option
	}

	function text_wavify(text){
		let spans = []
		let delay = 0
		for (i = 0; i < text.length; i++) {
			// Deal with encoded text
			if (text[i] == '<'){
				let encoded_class = text.substr(i).match(/class="([^"]*)"/)[1]
				// Eat the encoded part of the string
				do i++; while (text[i-1] != '>' && i < text.length)
				let span_encoded = $(`<span class="${encoded_class}">`)
				for (i; text[i] != '<' && i < text.length; i++)
					span_encoded.append(
						$(`<span style="animation-delay:${delay++}00ms">${(text[i] == ' ') ? '\xa0' : text[i]}</span>`)
							.addClass('wavy')[0]
					)
				spans.push(span_encoded[0])
				// Eat the encoded part of the string
				do i++; while (text[i-1] != '>' && i < text.length)
			}
			//
			spans.push(
				$(`<span style="animation-delay:${delay++}00ms">${(text[i] == ' ') ? '\xa0' : text[i]}</span>`)
					.addClass('wavy')[0]
			)
		}
		// Split words into inline-block spans
		let final = []
		let n = 0
		final[n] = $('<span class="wordspan">')[0]
		spans.forEach((s) => {
			if (s.innerHTML != '&nbsp;')
				final[n].append(s)
			else{
				final[n].append(s)
				final[++n] = $('<span class="wordspan">')[0]
			}
		})
		log(final)
		//
		return final
	}
	function text_encode(text){
		for (i=0; i<text.length; i++){
			if (text[i] == '@') 
				log(text = text.replace('@', '<span class="visitor">').replace('@', '</span>'))
			if (text[i] == '#') 
				log(text = text.replace('#', '<span class="shaky">').replace('#', '</span>'))
		}
		// let span = $('<span>').html(text)
		return text
	}
}


// -------------------------------------------- //
// -------------------------------------------- //
// ?------------- The Juicy Stuff ------------- //
// -------------------------------------------- //
// ?------------------ NPCs ------------------- //
const Dolly = new NPC('Dolly', 355, true)
Dolly.states.introduction = 0
Dolly.kamaoji = {}
Dolly.kamaoji.joy = '„• ᵕ •„'
Dolly.kamaoji.smug = '„˘ ᵕ ˘„'
Dolly.onGenerate = function() {setTimeout(() => {this.interact()}, 1000)}
Dolly.interact = async function(add=true){
	if (this.block_interaction == true) return
	if (this.states.introduction >= 0){
		if (add) Dolly.states.introduction++
		// What...
		if (Dolly.states.introduction == 1) this.set_speech('What...')
		// Who are you?
		//? Input
		else if (Dolly.states.introduction == 2){
			this.block_interaction = true
			this.set_speech('Who are you?')
			let in_ok = $('<div><span class="input-ok"> >> </span></div>')
			let in_name = $('<input type="text" size="1" placeholder="---">')
				.fadeOut(0)
			in_name.on('focus', () => move.can = false)
				.on('blur', () => move.can = true)
				.on('input', () => {
					if (in_name[0].value.length >= 3 && !in_name[0].nextElementSibling){
						this.add_element(in_ok)
						in_ok.on('click', () => {
							save('visitor', in_name[0].value)
							this.block_interaction = false
							this.interact()
						})
					}
					else if (in_name[0].value.length < 3) in_ok.remove()
				})
			await new Promise(r => setTimeout(r, 1600))
			this.add_element(in_name.fadeIn(delay_bubblefade))
		}
		// Ahh... Greetings, @user@...
		else if (Dolly.states.introduction == 3) this.set_speech(`Ahh... Greetings, @${get('visitor')}@...`)
		// ...But...
		else if (Dolly.states.introduction == 4) this.set_speech('...But...')
		// ...You weren't supposed to be here.
		//? Dialogue
		else if (Dolly.states.introduction == 5){
			this.block_interaction = true
			this.set_speech('...You weren\'t supposed to be here...')
			await new Promise(r => setTimeout(r, 3700))
			await this.add_dialogueOption('Oh, I\'m sorry...', function(){
				Dolly.states.introduction = 6
				Dolly.block_interaction = false
				Dolly.interact(false)
			})
			await this.add_dialogueOption('Why?', function(){
				Dolly.states.introduction = 13
				Dolly.block_interaction = false
				Dolly.interact(false)
			})
		}
		//* A
		// Oh, no, it's fine!
		else if (Dolly.states.introduction == 6) this.set_speech('Oh, no, it\'s fine!')
		// If you're here, I'd imagine he allowed you in... || right?
		//? Dialogue
		else if (Dolly.states.introduction == 7){
			this.block_interaction = true
			this.set_speech('If you\'re here, I\'d imagine he allowed you in', false)
			await new Promise(r => setTimeout(r, 4500))
			await new Promise(r => setTimeout(r, delay_options))
			this.add_speech('.', false)
			await new Promise(r => setTimeout(r, delay_options))
			this.add_speech('.', false)
			await new Promise(r => setTimeout(r, delay_options))
			this.add_speech('.', false)
			await new Promise(r => setTimeout(r, delay_options))
			this.add_speech(' right?', false)
			await this.add_dialogueOption('He did, yes!', function(){
				Dolly.states.introduction = 12
				Dolly.block_interaction = false
				Dolly.interact(false)
			})
			await this.add_dialogueOption('I think he did...', function(){
				Dolly.states.introduction = 12
				Dolly.block_interaction = false
				Dolly.interact(false)
			})
			await this.add_dialogueOption('Not really...', function(){
				Dolly.states.introduction = 8
				Dolly.block_interaction = false
				Dolly.interact(false)
			})
			this.block_interaction = false
		}
		//* A-1-N
		// Oh...
		else if (Dolly.states.introduction == 8) this.set_speech('Oh...')
		// ...Then...
		else if (Dolly.states.introduction == 9) this.set_speech('...Then...')
		// ...
		else if (Dolly.states.introduction == 10) this.set_speech('...')
		// ...Will you please leave? --- 11
		//? Dialogue
		else if (Dolly.states.introduction == 11){
			this.set_speech('...Will you please leave?')
			await new Promise(r => setTimeout(r, 2500))
			await this.add_dialogueOption('Yes', fuck_it_up)
			await this.add_dialogueOption('Yes', fuck_it_up)
		}
		//* A-1-Y
		// kamaoji.joy --- 12
		else if (Dolly.states.introduction == 12){
			this.bubble_reset()
			this.add_element($(`<span>${this.kamaoji.joy}</span>`))
		}
		//* -
		// Well, you see...
		else if (Dolly.states.introduction == 13) this.set_speech('Well, you see...')
		// This is a special place in his mind.
		else if (Dolly.states.introduction == 14) this.set_speech('This is a special place in his mind.')
		// It may look a bit empty, but that's because...
		else if (Dolly.states.introduction == 15) this.set_speech('It may look a bit empty, but that\'s because...')
		// Well, everything is well hidden.
		else if (Dolly.states.introduction == 16) this.set_speech('Well, everything is well hidden.')
		//* A
		// He does tend to be quite careful with how he opens up to people
		else if (Dolly.states.introduction == 17) this.set_speech('He does tend to be quite careful with how he opens up to people')
		// Despite his yearning to belong and be understood...
		else if (Dolly.states.introduction == 18) this.set_speech('Despite his yearning to belong and be understood...')
		// ... --- 19
		else if (Dolly.states.introduction == 19) this.set_speech('...')
		// Oh, but, by all means, do feel free to look around! || kamaoji.joy --- 20 || 21
		else if (Dolly.states.introduction == 20) this.set_speech('Oh, but, by all means, do feel free to look around!')
		else if (Dolly.states.introduction == 21){
			this.bubble_reset()
			this.add_element($(`<span>${this.kamaoji.joy}</span>`))
		}
		//* -
		// I'm sure you'll come across something, in time
		else if (Dolly.states.introduction == 22) this.set_speech('I\'m sure you\'ll come across something, in time')
		// ...Just try to be tidy, will you?
		else if (Dolly.states.introduction == 23) this.set_speech('...Just try to be tidy, will you?')
		// Maintaining this place is #more work than it might seem#...
		else if (Dolly.states.introduction == 24) this.set_speech('Maintaining this place is #more work than it might seem#...')
	}
}

// ?-------------- Runtime code --------------- //
$(document).ready(function(){
	log('Ready')
	move.can = true
	UpdateVariables()
	generate_grass()
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
	if (testGrass) grassTest = setInterval(() => generate_grass(false, 1000*Math.random()), 100)
})

// ?------------- Game functions -------------- //
function GameLoop() {
	if (!document.hasFocus())
		Object.keys(move).forEach(k => {
			if (k != 'can')
				move[k] = false
		})
	DoMovement()
	DoBoundaryCheck()
	if (visited.length == 1 && !$('.npc[data-name=Dolly]')[0]) {
		generate_npc('Dolly', 344)
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
	else $player.removeClass('moving-left')
	if (move.right)	Move('right')
	else $player.removeClass('moving-right')
	if (move.up)		Move('up')
	else $player.removeClass('moving-up')
	if (move.down)		Move('down')
	else $player.removeClass('moving-down')

	function Move(dir){
		if (move.can == false) return
		$player.addClass(`moving-${dir}`)
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
	generate_grass()
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
				generate_npc(e.name, e.color)
			}
		})
	}
}
function Interact(){
	if (move.can == false) return
	// log('Interacting...')
	let min = Infinity
	let closest
	Array.from(document.querySelectorAll('[data-interactable]')).forEach(e => {
		let npc
		npcs.forEach(n => {
			if (n.name == e.dataset.name) npc = n
		})
		if (distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y) <= 20)
			if (distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y) < min){
				closest = npc
				min = distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y)
			}
	})
	closest.interact()
}

// ?------------ Graphic functions ------------ //
function generate_grass(remove=true, seed_offset=0){
	if (remove) $('.grass').remove()
	let quantity = 10 + (chaos_hash(field.dataset.x, field.dataset.y, 22+seed_offset).x % 6 - 2)
	//log(`Generating ${quantity} grass`)
	for (i=0; i<quantity; i++){
		let pos = random_from_pos(field.dataset.x, field.dataset.y, 11+i+seed_offset)
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
function generate_npc(name='NPC', color=160){
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
	let ch = chaos_hash(color*32, color*color+15, 57)
	npc.pos = {x:(ch.x%80)-40,y:(ch.y%80)-40}
	$(npc.element).css('left', `calc(50% + ${npc.pos.x}vmin)`)
						.css('top', `calc(50% + ${npc.pos.y}vmin)`)
	$field.append(npc.element)
	if (npc.onGenerate) npc.onGenerate()
	return npc
}

// ?----------- Generator functions ----------- //
function chaos_hash(inx, iny, offset=0){
	let seed = 3332 + offset
	let outx = seed + inx * 374761393
	let outy = seed + iny * 668265263
	outx = (outx^(outx >> 13)) * 1274126177
	outy = (outy^(outy >> 29)) * 1274126177
	return {x:outx^(outx >> 7), y:outy^(outy >> 11)}
}
function random_from_pos(x, y, off){
	let out = chaos_hash(x, y, off)
	return {x:parseInt(out.x % 100), y:parseInt(out.y % 100)}
}

// ?----------- Assistive functions ----------- //
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
// -------------------------------------------- //