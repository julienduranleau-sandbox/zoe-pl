const TOKEN = {
    IDENTIFIER: "identifier",
    DEFINE: "define",
    OPEN_PAREN: "open_paren",
    CLOSE_PAREN: "close_paren",
    NEWLINE: "newline",
    EXPRESSION_PART: "expression_part",
    NUMBER: "number",
    STRING: "string",
}

fetch("working-sample.zoe").then(d => d.text()).then(d => {
    lex(d).map(token => {
        let t = null
        if (token.type === TOKEN.NEWLINE) {
            t = document.createElement("br")
        } else {
            t = document.createElement("span")
            t.textContent = `${token.type}(${token.value || ""}) `
        }
        document.body.appendChild(t)
    })
})

function lex(s) {
    const tokens = []
    const s_len = s.length
    let i = 0
    let wip_token = null

    while (i < s_len) {
        const c = s[i]
        const start_of_newline = i === 0 || s[i - 1] == "\n"

        if (c === "\n" || c === "\r") {
            if (wip_token) {
                tokens.push(wip_token)
                wip_token = null
            }
            tokens.push({ type: TOKEN.NEWLINE })

            i += (c === "\r" && s[i+1] === "\n")  // \r\n
                ? 2
                : 1

            continue
        }

        // if (start_of_newline && c === "d" && s.substr(i, "define".length)) {
        //     tokens.push({ type: TOKEN.DEFINE })
        //     i += "define ".length
        //     continue
        // }

        if (c == ".") {
            if (wip_token) {
                tokens.push(wip_token)
                wip_token = null
            }
            wip_token = { type: TOKEN.IDENTIFIER, value: "" }
            i++
            continue
        }

        if (wip_token && wip_token.type === TOKEN.IDENTIFIER) {
            if (/([a-z]|[0-9]|_)/i.test(c)) {
                wip_token.value += c
                i++
                continue
            } else {
                tokens.push(wip_token)
                wip_token = null
            }
        }

        if (c === "(") {
            if (wip_token) {
                tokens.push(wip_token)
                wip_token = null
            }
            tokens.push({ type: TOKEN.OPEN_PAREN })
            i++
            continue
        }

        if (c === ")") {
            if (wip_token) {
                tokens.push(wip_token)
                wip_token = null
            }
            tokens.push({ type: TOKEN.CLOSE_PAREN })
            i++
            continue
        }

        if (/([^\s])/.test(c)) {
            if (wip_token === null) {
                if (/[0-9]/.test(c)) {
                    wip_token = { type: TOKEN.NUMBER, value: c }
                } else if (c === '"' || c === "'") {
                    wip_token = { type: TOKEN.STRING, value: c }
                } else {
                    wip_token = { type: TOKEN.EXPRESSION_PART, value: c }
                }
            } else {
                wip_token.value += c
            }
        } else {
            if (wip_token) {
                tokens.push(wip_token)
                wip_token = null
            }
        }

        i++
    }

    if (wip_token) {
        tokens.push(wip_token)
        wip_token = null
    }

    return tokens
}