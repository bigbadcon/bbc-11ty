---
layout: layouts/page.njk
title: How to Use Dicecord
description: ''
tags: pages
---

Playing an online game and need to roll some dice or draw some cards? We've got you covered! The Go Play NW community server is equipped with virtual dice roller and card deck bot called [Dicecord](). There's a lot that Dicecord can do from compliated rolls involving exploding dice, hitting specific targets, handling poker and tarot decks, and even saving common commands/rolls that you do.

But most of that is more than what most folks will need Dicecord to do. So, let's teach you how to do some basic rolls and drawing a standard card deck. If you want to dig into further details about everything Dicecord can do, check out [Diceord's full help documentation](https://github.com/ShooterAndy/Dicecord/tree/master/help). 

* [Basic dice rolls](#basic-dice-rolls)
* [Standard playing cards](#standard-playing-cards)
* [Tarot deck](#tarot-deck)
* [For the Queen deck](#for-the-queen-deck)

## Basic dice rolls
To roll some dice you need to type in a `/roll` command into your game room channel on discord. You will be presented related commands in the server. Select the one for Dicecord.

Discord will prompt you to specity what sort of roll you want Dicebot to perform for you. Your Discord text bar will look something like this:
```
/roll roll_command:
```

Type in the roll you want to make in the format of `[number of dice]d[type of die]`.

For example, if you wanted to roll two 6-sided dice, your roll command would look something like this:

```
/roll roll_command: 2d6
```
Press `Enter` or the send button in Discord to submit your roll, and Diecord will give you the result for each individual die rolled and your total result.

### Adding and subtracting from your rolls
You can add or subtract from your roll's total by adding `+` or `-` and the amount you want to change your result by.

For example, if you're rolling with `Cool` and that means you get a `+1` to your roll, your roll command would look something like this: 
```
/roll roll_command: 2d6+1
```

### Counting successes
If you need to roll several dice and count how many of them rolled a 5 or a 5, Dicecord can give you that number if you tell Dicecord to count all dice that rolled over a 4 by adding `co4` to the end of your roll command. Your roll command would look something like this:

```
/roll roll_command: 5d6co4
```
If you need to count the 1s and 2s you can have Dicecord to count all dice that rolled under a 3 instead by adding `cu3` at the end of your roll command. Your roll command would look something like this:

```
/roll roll_command: 5d6cu3
```

And, if you just needed to get the number of dice that rolled a 4, you would add `ce4` at the end of your roll command, like this:

```
/roll roll_command: 5d6ce4
```

### More things you can do with dice
Dicecord supports a number of other ways to roll virtual dice. Read more about them in Dicecord's [Roll command documentation](https://github.com/ShooterAndy/Dicecord/blob/master/detailedHelp/roll.md).

## Standard playing cards
Dicecord lets you assign a virtual deck of playing cards to your game room. As long as you type in your commands within *your* game room, you can freely shuffle and draw cards from this virtual card deck without messing with anyone else's game.

To get started you need to tell Dicecord to shuffle a fresh deck of playing cards:
```
/shuffle
```
If you ever need a new fresh deck of cards for your game room, you can use the `/shuffle` command to get your game room a new, freshly shuffled deck.

### Drawing cards from a deck
Once you have a freshly shuffled deck for your game room, you can draw a card from the deck using the `/draw` command.
```
/draw
```
If you want to draw more than 1 card, you can specify the amount of cards you want to draw. For example if you wanted to draw 3 cards your command would look something like this:
```
/draw number_of_cards_to_draw: 3
```
You can also draw your cards in secret, and Dicecord will send you the cards you drew as a Direct Message. For example, if you wanted to draw 5 cards and keep them secret your command would look something like this:
```
/draw number_of_cards_to_draw:5 is_private:True
```
### Putting cards back into the deck
If you need to add a card back into the deck, you can use the `/insert` command and specifying which cards you want separated by commas. For example, if you wanted to shuffle the 5 of spades and 6 of spades back to your deck you would type the command:
```
/insert cards:5 of Spades, 6 of Spades
```
Note that you can add multiple copies of the same card to your deck this way.

### Tarot deck
Go Play NW has configured Dicecord to support the use of a Tarot deck. To assign a freshly shuffled tarot deck to your game room you will need to execute a saved command:
```
/executesaved name:shuffletarot
```
Once you have shuffled your virtual tarot deck, you can draw and shuffle cards back into it the same way you would with [standard playing cards](#standard-playing-cards).

##  For the Queen deck
Go Play NW has also configured Dicecord to support the use of a virtual *For the Queen* deck. This virtual deck ONLY includes the question cards; it does not include the set up instruction cards, the Queen cards, or the X card. You will need to find another way to facilitate those cards.

It also does NOT include "The Queen is Under Attack" card. See [The queen is under attack](#the-queen-is-under-attack)

To assign a freshly shuffled *For the Queen* deck to your game room you will need to execute a saved command:
```
/executesaved name:shuffleForQueen
```
Once you have shuffled your virtual *For the Queen* deck, you can draw and shuffle cards back into it the same way you would with [standard playing cards](#standard-playing-cards).
### The Queen is under attack
By default "The Queen is Under Attack" card is **not** included in the virtual *For the Queen* deck built into Dicecord. This is because Dicecord adds the cards to a deck at random. If we included "The Queen is Under Attack" card in your freshly shuffled deck, you could potentially draw it on your first turn! That would be a very brief game of *For the Queen*.

Instead, we recommend that you:
1. Continue play. drawing from your *For the Queen* deck until you feel that you are starting to get close to when you want to end the game.
2. Look at the remaining number of cards left (each time you draw a card, Dicecord tells you the number remaining in the deck) and remove as many cards as needed until you have 10 cards left. (For example, if you have 28 cards left in the deck, you can remove and discard 18 of those cards by entering the command:
```
/draw number_of_cards_to_draw:18
```
3. If you want to keep the cards that were discarded a secret, make sure to add the `is_private:True` to your command. For example:
```
/draw number_of_cards_to_draw:18 is_private:True`)
```
4. Now add the "The Queen is under attack" card using the following command:

```
/insert cards:The Queen is under attack. Do you defend her?
```
5. Continue playing until you draw "The Queen is under attack. Do you defend her" card.