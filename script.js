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
const STEP = 2
const SPRINT_MULTIPLIER = 1.5
const DELAY_BUBBLEFADE = 300
const DELAY_BUBBLE_ELEMENTS = 700
const INTERACTION_RANGE = 20
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
/*function NPC(name='NPC', color, interactable=true){
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
	this.save = () => save(this.name, JSON.stringify(this))
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
		$(this.element[0].querySelector('.bubble')).fadeOut(DELAY_BUBBLEFADE)
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
			.fadeOut(0).fadeIn(DELAY_BUBBLEFADE)
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
		this.bubble().fadeOut(0).fadeIn(DELAY_BUBBLEFADE)
		return this
	}
	this.add_element = function(element){
		this.bubble().append(element)
		return this
	}
	this.add_dialogueOption = async function(text, callback=null){
		await new Promise(r => setTimeout(r, DELAY_BUBBLE_ELEMENTS))
		let option = $(`<span class="dialogue-option">${text}</span>`)
			.fadeOut(0)
		this.bubble().append(option)
		option.click(callback)
			.fadeIn(DELAY_BUBBLE_ELEMENTS)
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
} */
function NPC(name='NPC', color=0, interactable=true){
	this.name = name
	this.color = color
	this.location
	this.pos
	this.current_stage
	this.stages = {}
	this.can_interact = interactable
	this.element = (interactable)
		? $(`<div class="npc" style="filter:hue-rotate(${360-color}deg)" data-name="${this.name}" data-interactable>`)
		: $(`<div class="npc" style="filter:hue-rotate(${360-color}deg)" data-name="${this.name}">`)
	this.bubble
	this.is_skippable = true

	this.sv = () =>
		save(this.name, JSON.stringify(this))
	this.block_interaction = async (block, set_controls=true) => {
		this.can_interact = !block
		if (set_controls)
			this.display_controls_interact(!block)
		// if (block) 
		// 	this.element.removeAttr('data-interactable')
		// else 
		// 	this.element.attr('data-interactable', '')
		}
	this.display_controls_interact = async (show, fadeTime=0) => {
		await new Promise(r => setTimeout(r, fadeTime))
		this.is_skippable = show
		if (this.bubble)
			(show) ?
				this.bubble.addClass('skippable')
				: this.bubble.addClass('skippable')
		}
	this.display_controls_select = async (show, fadeTime=0) => {
		await new Promise(r => setTimeout(r, fadeTime))
		if (this.bubble)
			(show) ?
				this.bubble.addClass('select')
				: this.bubble.addClass('select')
		}
	this.bubble_create = async (fadeIn=true) => {
		let bubble = $(`<div class="bubble ${(this.is_skippable)?'skippable':''}" style="filter:hue-rotate(${360-color}deg)">`)
			.append($(`<span class="name" style="color:hsl(${this.color}deg, 100%, 50%)">${this.name}</span>`))
			.append($('<br>'))
			.fadeOut(0)
		$(this.element).append(bubble)
		if ((this.element[0].getBoundingClientRect().x - window.innerWidth/2) <= 0)
			bubble.addClass('to-right')
		else
			bubble.addClass('to-left')
		if (fadeIn) {
			bubble.fadeIn(DELAY_BUBBLEFADE)
			// await new Promise(r => setTimeout(r, delay_bubblefade))
		}
		else
			bubble.fadeIn(0)
		this.bubble = bubble
		return this
		}
	this.bubble_clear = async (fadeOut=true) => {
		if (fadeOut){
			this.bubble.fadeOut(DELAY_BUBBLEFADE)
			await new Promise((r) => setTimeout(r, DELAY_BUBBLEFADE))
		}
		this.bubble.remove()
		this.bubble = undefined
		return this
		}
	this.bubble_reset = async (fadeIn=true, fadeOut=true) => {
		if (this.bubble)
			await this.bubble_clear(fadeIn)
		await this.bubble_create(fadeOut)
		return this
		}
	this.speech_add = async (text='', newline=true, fullword=false, shaky=false, wavy=true, fadeIn=true) => {
		text = text_encode(text)
		let speech
		// If needed, create bubble
		if (!this.bubble)
			await this.bubble_create()
		// If not in a new line, look for the last .speech element to append text to
		if (!newline) {
			// If there is no .speech element, create an empty one
			if (!this.bubble[0].querySelector('.speech')){
				await this.speech_add('')
				speech = $(this.bubble[0].querySelector('.speech'))
			}
			// Else, use the last one found
			else
				speech = $(this.bubble[0].querySelectorAll('.speech')).last()
		}
		// If in a new line
		else
			speech = $('<span class="speech">')
		// If text is to be animated, separate it into individual characters
		let lettercount = 0
		if (wavy || fadeIn) {
			let wordspan = $('<span class="wordspan"></span>')[0]
			speech.append(wordspan)
			for (i=0; i<text.length; i++){
				// Deal with encoded text
				if (text[i] == '<'){
					let encoded_class = text.substring(i).match(/class="([^"]*)"/)[1]
					// Eat the encoded part of the string
					do i++; while (text[i-1] != '>' && i < text.length)
					for (i; text[i] != '<' && i < text.length; i++) {
						if (fullword)
							wordspan.appendChild($(`<span class="${encoded_class} ${(wavy)?'wavy':''} ${(fadeIn)?'fade-in':''} ${(shaky)?'shaky':''}" style="--order:${lettercount++}">${text[i]}</span>`)[0])
						else if (text[i] != ' ')
							wordspan.appendChild($(`<span class="${encoded_class} ${(wavy)?'wavy':''} ${(fadeIn)?'fade-in':''} ${(shaky)?'shaky':''}" style="--order:${lettercount++}">${text[i]}</span>`)[0])
						else{
							speech.append($(`<span class="${(wavy)?'wavy':''} ${(fadeIn)?'fade-in':''} ${(shaky)?'shaky':''}" style="--order:${lettercount++}">`).html('&nbsp;'))
							wordspan = $('<span class="wordspan"></span>')[0]
							speech.append(wordspan)
						}
					}
					// Eat the encoded part of the string
					do i++; while (text[i-1] != '>' && i < text.length)
				}
				if (text[i] != ' ')
					wordspan.appendChild($(`<span class="${(wavy)?'wavy':''} ${(fadeIn)?'fade-in':''} ${(shaky)?'shaky':''}" style="--order:${lettercount++}">${text[i]}</span>`)[0])
				else{
					speech.append($(`<span class="${(wavy)?'wavy':''} ${(fadeIn)?'fade-in':''} ${(shaky)?'shaky':''}" style="--order:${lettercount++}">`).html('&nbsp;'))
					wordspan = $('<span class="wordspan"></span>')[0]
					speech.append(wordspan)
				}
			}
		}
		else
			speech.append($('<span>').text(text))
		if (newline) {
			if (this.bubble[0].querySelector('.speech'))
				this.bubble.append($('<br>'))
			this.bubble.append(speech)
		}
		if (fadeIn)
			await new Promise((r) => setTimeout(r, lettercount * 100))
		return this
		}
	this.speech_set = async (text, shaky=false, wavy=true, fadeIn=true) => {
		text = text_encode(text)
		await this.bubble_reset()
		await this.speech_add(text, false, false, shaky, wavy, fadeIn)
		return this
		}
	this.add_custom_element = async (element, fadeIn=true) => {
		$(element).fadeOut(0)
		this.bubble.append(element)
		if (fadeIn) {
			$(element).fadeIn(DELAY_BUBBLE_ELEMENTS)
			await new Promise(r => setTimeout(r, DELAY_BUBBLE_ELEMENTS))
		}
		return this
		}
	this.dialogue_option_add = async (text, callback, fadeIn=true) => {
		text = text_encode(text)
		let option = $(`<span class="dialogue-option">${text}</span>`)
		.fadeOut(0)
			.on('click', callback)
			this.bubble.append(option)
		if (fadeIn)
			option.fadeIn(DELAY_BUBBLE_ELEMENTS)
		else
			option.fadeIn(0)
		if (fadeIn) await new Promise(r => setTimeout(r, DELAY_BUBBLE_ELEMENTS))
		return this
	}

	function text_encode(text) {
		for (i=0; i<text.length; i++){
			if (text[i] == '@') 
				text = text.replace('@', '<span class="visitor">').replace('@', '</span>')
			if (text[i] == '#') 
				text = text.replace('#', '<span class="shaky">').replace('#', '</span>')
		}
		// let span = $('<span>').html(text)
		return text
	}
}
/* function Interaction(id, speeches, custom_elements, order){
	this.id = id
	this.npc
	this.speeches = []
	this.custom_elements = []
	this.order = []
	this.next_interaction_id

	this.display = () => {
		for (item in order){
			
		}
	}
	} */


// -------------------------------------------- //
// -------------------------------------------- //
// ?------------- The Juicy Stuff ------------- //
// -------------------------------------------- //
// ?------------------ NPCs ------------------- //
const Dolly = new NPC('Dolly', 355, true)
Dolly.current_stage = 'introduction'
Dolly.stages['introduction'] = -1
Dolly.kamaoji = {
	joy:			'„• ᵕ •„',
	smug:			'„˘ ᵕ ˘„',
	sus:			'눈 _ 눈',
	shocked:		'„⁰ ヘ ⁰„',
	embarrassed:'„⇀ ヘ ↼„',
	sad:			'„•́ ‸ •́„',
}
Dolly.block_interaction(true)
Dolly.display_controls_interact(false)
Dolly.display_controls_select(false)
Dolly.onGenerate = () => {setTimeout(() => {Dolly.interact(true, true)}, 1000)}
Dolly.interact = async (advance_stage=true, ignore_blocking=false) => {
	// log(`Dolly.interact: ${advance_stage} ${ignore_blocking}`)
	if (!Dolly.can_interact && !ignore_blocking)
		return
	if (advance_stage)
		Dolly.stages[Dolly.current_stage]++
	if (Dolly.current_stage == 'introduction') {
		switch (Dolly.stages['introduction']) {
			case 0: // ...'
				await Dolly.speech_set('...!')
				await new Promise(r => setTimeout(r, 1000))
				Dolly.interact(true, true)
				break
			case 1: // Who are you?
				await Dolly.speech_set('Who are you?')
				let in_ok = $('<div><span class="input-ok"> >> </span></div>')
				let in_name = $('<input type="text" size="1" placeholder="---">')
					.on('focus', () => move.can = false)
					.on('blur', () => move.can = true)
					.on('input', () => {
						if (in_name[0].value.length >= 3 && !in_name[0].nextElementSibling){
							Dolly.add_custom_element(in_ok)
							in_ok.on('click', async () => {
								save('visitor', in_name[0].value)
								Dolly.interact(true, true)
							})
						}
						else if (in_name[0].value.length < 3) in_ok.remove()
					})
				await Dolly.add_custom_element(in_name)
				break
			case 2: // Ahh... Greetings, visitor...
				await Dolly.speech_set(`Ahh... Greetings, @${get('visitor')}@... ${Dolly.kamaoji.joy}`)
				Dolly.block_interaction(false, true)
				break
			case 3: // Pardon my surprise, but...
				Dolly.block_interaction(true, true)
				await Dolly.speech_set('Pardon my surprise, but...')
				Dolly.block_interaction(false, true)
				break
			case 4: // ...You weren't supposed to be here...
				Dolly.block_interaction(true, true)
				await Dolly.speech_set(`...You weren't supposed to be here... ${Dolly.kamaoji.shocked}`)
				await Dolly.dialogue_option_add(`Oh, I'm sorry...`, () => {
					Dolly.stages['introduction'] = 5
					Dolly.interact(false, true)
				})
				Select(0, Dolly)
				Dolly.display_controls_select(true)
				break
			case 5: // Oh, no, it's fine!
				await Dolly.block_interaction(true, true)
				await Dolly.speech_set(`Oh, no, it's fine!`)
				Dolly.block_interaction(false, true)
				break
			case 6: // If you're here, I'd imagine he allowed you in... right?
				Dolly.block_interaction(true, true)
				await Dolly.speech_set(`If you're here, I'd imagine he allowed you in`)
				await new Promise(r => setTimeout(r, 1000))
				await Dolly.speech_add('...right? ', false)
				await Dolly.speech_add(Dolly.kamaoji.sus, true, false, true)
				await Dolly.dialogue_option_add('He did', () => {
					Dolly.stages['introduction'] = 7
					Dolly.interact(false, true)
				})
				await Dolly.dialogue_option_add('I think he did...', () => {
					Dolly.stages['introduction'] = 8
					Dolly.interact(false, true)
				})
				await Dolly.dialogue_option_add('...Not really...', () => {
					Dolly.stages['introduction'] = 9
					Dolly.interact(false, true)
				})
				Select(0, Dolly)
				Dolly.display_controls_select(true)
				break
			case 7: // [He did] See? „• ᵕ •„
				Dolly.block_interaction(true)
				await Dolly.speech_set('See? '+Dolly.kamaoji.joy)
				await Dolly.dialogue_option_add('What is this place?', () => {
					Dolly.stages['introduction'] = 11
					Dolly.interact(false, true)
				})
				Select(0, Dolly)
				Dolly.display_controls_select(true)
				break
			case 8: // [I think he did...] Maybe you should ask him, just in case „• ᵕ •„
				Dolly.block_interaction(true)
				await Dolly.speech_set(`Maybe you should ask him, just in case ${Dolly.kamaoji.joy}`, false, true)
				await Dolly.dialogue_option_add('What is this place?', () => {
					Dolly.stages['introduction'] = 11
					Dolly.interact(false, true)
				})
				Select(0, Dolly)
				Dolly.display_controls_select(true)
				break
			case 9: // [Not really...] Oh...
				Dolly.block_interaction(true)
				await Dolly.speech_set(`Oh... ${Dolly.kamaoji.sad}`, false, true)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 10: // Then... Please leave...
				Dolly.block_interaction(true)
				await Dolly.speech_set(`Then... Please leave...`, false, true)
				setInterval(() => {
					Dolly.speech_set(`...Leave...`, false, true)
					field.innerText = field.innerHTML
				}, 3000)
				break
			case 11: // [What is this place?] This is a special place in his mind
				Dolly.block_interaction(true)
				await Dolly.speech_set('You see... This is a special place in his mind')
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 12: // It may look a bit empty, but that's because...
				Dolly.block_interaction(true)
				await Dolly.speech_set(`It may look a bit empty, but that's because...`)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 13: // Well, everything is well hidden.
				Dolly.block_interaction(true)
				await Dolly.speech_set(`Well, everything is well hidden.`)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 14: // He does tend to be careful with how he opens up to people...
				Dolly.block_interaction(true)
				await Dolly.speech_set(`He does tend to be careful with how he opens up to people...`)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 15: // But I'm sure you'll come across something, in time! „˘ ᵕ ˘„
				Dolly.block_interaction(true)
				await Dolly.speech_set(`But I'm sure you'll come across something, in time! ${Dolly.kamaoji.smug}`)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 16: // Just... try to be tidy, will you?
				Dolly.block_interaction(true)
				await Dolly.speech_set(`Just... try to be tidy, will you?`)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 17: // Maintaining this place is #more work than it might seem#...
				Dolly.block_interaction(true)
				await Dolly.speech_set(`Maintaining this place is #more work than it might seem#...`)
				Dolly.block_interaction(false)
				Dolly.display_controls_interact(true)
				break
			case 18: // Introduction end
				await Dolly.bubble_clear()
				Dolly.current_stage = 'discovery'
		}
	}
}

// ?-------------- Runtime code --------------- //
$(function(){
	log('Ready')
	move.can = true
	UpdateVariables()
	generate_grass()
	$(window).on('keydown', (e) => {
		// log(e.which)
		switch (e.which){
			case 38:
				Select(-1)
				break
			case 40:
				Select(+1)
				break
			case 65:
				move.left = true
				break
			case 68:
				move.right = true
				break
			case 87:
				move.up = true
				break
			case 83:
				move.down = true
				break
			case 16:
				move.sprint = true
				break
		}
		// log(e.which)
	})
	$(window).on('keyup', (e) => {
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
	if (visited.length == 4 && !$('.npc[data-name=Dolly]')[0]) {
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
		let stepsize_vmin = STEP
		// let stepsize_px = vmin(STEP)
		let diagonal_adjust = 0.7
		if (move.sprint) stepsize_vmin *= SPRINT_MULTIPLIER
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
	let closest = FindClosestInteractable()
	if (closest) {
		if (closest.can_interact)
			closest.interact()
		else
			if (closest.bubble[0]?.querySelector('.dialogue-option[data-selected]'))
				closest.bubble[0]?.querySelector('.dialogue-option[data-selected]').click()
	}
}
function Select(direction=0, override=null){
	if (move.can == false) return
	let closest
	if (override)
		closest = override
	else
		closest = FindClosestInteractable()
	if (closest){
		let options = closest.bubble[0].querySelectorAll('.dialogue-option')
		log(options)
		let selected
		for (i=0; i<options.length; i++)
			if (options[i].dataset.selected == '') selected = i
		log(`Selected is ${selected}`)
		if (direction == 0)
			$(options[0]).attr('data-selected', '')
		else if (selected+direction > -1 && selected+direction < options.length) {
			$(options[selected]).removeAttr('data-selected')
			$(options[selected+direction]).attr('data-selected', '')
			log(`New selection is ${selected+direction}`)
		}


		// if (direction == -1) {
		// 	if (selected > 0) {
		// 		$(options[selected]).removeAttr('data-selected')
		// 		$(options[selected-1]).attr('data-selected', '')
		// 	}
		// }
		// if (direction == 1) {
		// 	if (selected < options.length-1) {
		// 		$(options[selected]).removeAttr('data-selected')
		// 		$(options[selected+1]).attr('data-selected', '')

		// 	}
		// }

	}
}
function FindClosestInteractable() {
	let min = Infinity
	let closest
	Array.from(document.querySelectorAll('[data-interactable]')).forEach(e => {
		let npc
		npcs.forEach(n => {
			if (n.name == e.dataset.name)
				npc = n
		})
		if (distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y) <= INTERACTION_RANGE)
			if (distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y) < min) {
				closest = npc
				min = distance_between(ppos.x, ppos.y, npc.pos.x, npc.pos.y)
			}
	})
	return closest
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
	$player.after(npc.element)
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