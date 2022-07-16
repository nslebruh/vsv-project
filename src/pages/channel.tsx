/* eslint-disable @typescript-eslint/no-shadow */
import { useState,  useEffect, useRef} from "react";
import {
  useLocation,
} from "react-router-dom";
import {
  getRef,
} from "../firebase/functions/database";
import {
  useAuthProvider,
} from "../firebase/context/auth"
import "./channels.scss"
import { onValue, update, push, off, query, orderByChild, limitToLast } from "firebase/database";
import { Stack, Form, Button, Row, Col, Container } from "react-bootstrap";

export const Channel = () => {
  let y: any = useRef(0)
  let refs: any = useRef([])
  const location = useLocation();
  const user = useAuthProvider();
  const [channel, setChannel] = useState(location.pathname.split("/c/")[1])
  const [messages, setMessages] = useState<Array<any>>([])
  const [error, setError] = useState<any>(null)
  const [message, setMessage] = useState<string>("")
  const isElementInViewport = (el: Element | null) => {
    if (el === null) {
      return
    }
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }

  const sendMessage = (channel: any, message: string) => {
    const newMessageRef = push(getRef());
    const newMessageKey = newMessageRef.key;
    const updates: any = {};
    updates[`/channels/${channel}/latestMessage`] = {
      key: newMessageKey,
      timestamp: Date.now(),
      text: message,
      name: user.email
    };
    updates[`/messages/${channel}/${newMessageKey}`] = {
      timestamp: Date.now(),
      text: message,
      name: user.email,
      key: newMessageKey
    };
    update(getRef(), updates)
      .then(() => {
        console.log("update successful")
      })
      .catch((error) => {
        console.log(error)
        setError(error)
      })
  }
  //const deleteMessage = (id: string) => {
  //  const messageRef = 
  //}
  //
  //const updateMessage = (id: string, message: string) => {
  //
  //}
  useEffect(() => {
    console.log("component mounted")
    return () => {console.log("component unmounted")}
  }, [])

  useEffect(() => {
    console.log("Messages useEffect - y.current: " + y.current)
    console.log("Messages useEffect - current messages: ")
    console.log(messages)
    if (messages.length !== 0 && messages !== []) {
      console.log("Messages useEffect - there are messages")
      let el: HTMLElement | null = document.getElementById(messages[messages.length - 4].key)
      if (y.current === 0) {
        console.log("y.current: " + y.current)
        console.log("scrolling to element: " + refs.current[messages[messages.length - 1].key].innerText)
        setTimeout(() => {
          console.log("scrolling now")
          const el = document.getElementById(messages[messages.length - 1].key)
          console.log(el)
          el?.scrollIntoView({behavior: "smooth", block: "end"})
          console.log("scrolled now")
        }, 200)
        y.current = 1
      } else if (isElementInViewport(el)) {
        refs.current[messages[messages.length - 1].key].scrollIntoView({behavior: "smooth", block: "end"})
      }
    } 
  }, [messages])

  useEffect(() => {
    console.log("------------------------------------------------------")
    console.log("------------------------------------------------------")
    console.log("------------------------------------------------------")
    off(getRef(`/messages/${channel}`))
    y.current = 0
    refs.current = []
    setMessages([])
    setError(null)
    console.log("Channel: " + location.pathname.split("/c/")[1])
    setChannel(location.pathname.split("/c/")[1]);
    onValue(query(getRef(`/messages/${location.pathname.split("/c/")[1]}`), orderByChild('timestamp'), limitToLast(25)), (snapshot) => {
      console.log("messages got")
      setError(null)
      let newMessages: any = []
      snapshot.forEach((childSnapshot) => {
        let data = { key: childSnapshot.key, ...childSnapshot.val() };
        newMessages.push(data);
      })
      console.log("last message: " + JSON.stringify(newMessages[newMessages.length - 1]))
      setMessages(newMessages)
    }, (error: any) => {
      console.log(error)
      setError({code: error.code, message: error.message})
    })
    return () => {
      off(getRef(`/messages/${location.pathname.split("/c/")[1]}`))
    }
  }, [location])
  
  return (
    <div className="messagePage">
      <div className="channelInfo">
        <h1>Channel: {channel}</h1>
        {error ? <p>{error.code}: {error.message}</p> : null}
      </div>
      
      {messages.length > 0 && messages 
        ?
        <>
          <div className="messages">
            <Stack gap={3}>
              {messages.map((m, i) => {return (
                <div className="message" ref={(el) => {refs.current[m.key] = el}} key={i} id={m.key}>
                  <span className="timestamp">
                    ({new Date(
                      new Date(m.timestamp).setMinutes(
                        new Date(m.timestamp).getMinutes() -
                          new Date(m.timestamp).getTimezoneOffset()
                      )
                    ).toUTCString()})
                  </span>
                  <span className="user">
                    {m.name}:
                  </span>
                  <div className="text">
                    {m.text}
                  </div>  
                </div>
              )})}
            </Stack>
          </div>
          <Container fluid className="messageForm">
            <div className="messageForm">
              <Form onSubmit={(event) => {
                sendMessage(channel, message);
                setMessage("");
                event.preventDefault();
              }}
              >
                <Row className="align-items-center">
                  <Col>
                    <Form.Control 
                      type="text"
                      placeholder="..." 
                      name="message" 
                      id="message"  
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    >
                    </Form.Control>
                  </Col>
                  <Col md="auto">
                    <Button type="submit" value="Submit">
                      Send message
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
            
          </Container>
          
        </>
        : null
      }
    </div>
  )
}
