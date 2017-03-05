/*
 * Copyright (C) 2016, 2017 Stefano D'Angelo <zanga.mail@gmail.com>
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
		name: "Marca",

		init: function (node, elementProtos, pushAttrs) {
			var protos = elementProtos;
			if (Array.isArray(protos)) {
				protos = {};
				for (var i = 0; i < elementProtos.length; i++)
					for (var p in elementProtos[i])
						protos[p] = elementProtos[i][p];
			}

			this.children = [];
			this.meta = {};

			if (this.pushAttrs) {
				if (pushAttrs)
					for (var a in this.pushAttrs)
						pushAttrs[a]
							= this.pushAttrs[a];
				else
					pushAttrs =
						Object.create(this.pushAttrs);
			}

			for (var i = 0;
			     node.children && i < node.children.length; i++) {
				var proto;
				if (typeof node.children[i] == "string")
					proto = Marca.DOMElementText;
				else if (node.children[i].id in protos)
					proto = protos[node.children[i].id];
				else
					proto = Marca.DOMElement;

				this.children[i] = Object.create(proto);

				if (pushAttrs)
					for (a in pushAttrs)
						this.children[i][a] =
							pushAttrs[a];

				this.children[i].init(node.children[i], protos);
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
	Marca.DOMElementRoot.name = "root";

	Marca.DOMElementText = Object.create(Marca.DOMElement);
	Marca.DOMElementText.name = "text";
	Marca.DOMElementText.initContent = function (node) {
		this.text = node;
		return [];
	};

	Marca.DOMElementTextOnly = Object.create(Marca.DOMElement);
	Marca.DOMElementTextOnly.name = "text-only";
	Marca.DOMElementTextOnly.initContent = function (node) {
		var ta = Marca.DOMElement.initContent.call(this, node);

		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if (!(Marca.DOMElementText.isPrototypeOf(child)))
				throw this.name + " element's child is not a "
				      + "text element";
		}

		return ta;
	};

	Marca.DOMElementThrowAway = Object.create(Marca.DOMElement);
	Marca.DOMElementThrowAway.name = "throw-away";
	Marca.DOMElementThrowAway.process = function (parent, position) {
	};

	Marca.DOMElementTextOnlyThrowAway =
		Object.create(Marca.DOMElementThrowAway);
	Marca.DOMElementTextOnlyThrowAway.name = "text-only throw-away";
	Marca.DOMElementTextOnlyThrowAway.initContent =
		Marca.DOMElementTextOnly.initContent;

	Marca.DOMElementComment =
		Object.create(Marca.DOMElementThrowAway);
	Marca.DOMElementComment.name = "comment";

	Marca.DOMElementMeta = Object.create(Marca.DOMElementTextOnlyThrowAway);
	Marca.DOMElementMeta.name = "meta";
	Marca.DOMElementMeta.initContent = function (node) {
		var ta = Marca.DOMElementTextOnlyThrowAway
			      .initContent.call(this, node);

		if (!("key" in node.attributes))
			throw this.name + " element without key attribute";

		this.key = node.attributes.key;
		var s = '';
		for (var i = 0; i < this.children.length; i++)
			s += this.children[i].text;
		this.value = JSON.parse(s);

		return ta;
	};
	Marca.DOMElementMeta.process = function (parent, position) {
		parent.meta[this.key] = this.value;
	};

	Marca.CommonElementProtos = {
		c:	Marca.DOMElementComment,
		meta:	Marca.DOMElementMeta
	};
};
