/*
 * Copyright (C) 2016 Stefano D'Angelo <zanga.mail@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

module.exports = function (Marca)
{
	Marca.DOMElement = {
		children: null,
		meta: null,

		init: function (node, elementProtos) {
			this.children = [];
			this.meta = {};

			for (var i = 0;
			     node.children && i < node.children.length; i++) {
				var proto;
				if (typeof node.children[i] == "string")
					proto = Marca.DOMElementText;
				else if (node.children[i].id in elementProtos)
					proto = elementProtos[
							node.children[i].id];
				else
					proto = Marca.DOMElement;

				this.children[i] = Object.create(proto);
				this.children[i].init(node.children[i],
						      elementProtos);
			}

			var ta = this.initContent(node);
			for (var i = 0; i < ta.length; i++)
				ta[i].element.process(this, ta[i].position);
		},

		initContent: function (node) {
			var ta = [];
			for (var i = 0; i < this.children.length; i++) {
				var child = this.children[i];
				if (Marca.DOMElementThrowAway
					 .isPrototypeOf(child)) {
					this.children.splice(i, 1);
					ta.push({ element: child,
						  position: i });
					i--;
				}
			}
			return ta;
		}
	};

	Marca.DOMElementRoot = Object.create(Marca.DOMElement);

	Marca.DOMElementText = Object.create(Marca.DOMElement);
	Marca.DOMElementText.initContent = function (node) {
		this.text = node;
		return [];
	};

	Marca.DOMElementThrowAway = Object.create(Marca.DOMElement);
	Marca.DOMElementThrowAway.process = function (parent, position) {
	};

	Marca.DOMElementComment = Object.create(Marca.DOMElementThrowAway);
	Marca.DOMElementComment.initContent = function (node) {
		if (this.children.length > 1)
			throw "comment contains multiple children element";
		if (!(Marca.DOMElementText.isPrototypeOf(this.children[0])))
			throw "comment's child is not a text element";
		return [];
	};

	Marca.DOMElementMeta = Object.create(Marca.DOMElementThrowAway);
	Marca.DOMElementMeta.initContent = function (node) {
		if (!("key" in node.attributes))
			throw "meta without key attribute";
		if (this.children.length > 1)
			throw "meta contains multiple children element";
		if (!(Marca.DOMElementText.isPrototypeOf(this.children[0])))
			throw "meta's child is not a text element";

		this.key = node.attributes.key;
		this.value = JSON.parse(this.children[0].text);
		return [];
	};
	Marca.DOMElementMeta.process = function (parent, position) {
		parent.meta[this.key] = this.value;
	};
};
