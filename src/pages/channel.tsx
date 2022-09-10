/* eslint-disable @typescript-eslint/no-shadow */
import useState  from "react-usestateref"
import { useEffect, useRef} from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore
//import {default as scrollToComponent} from "react-scroll-to-component"
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
import { onValue, update, push, off, query, get, limitToFirst, increment, onChildAdded, orderByChild, startAfter, DataSnapshot, /*limitToLast,*/ } from "firebase/database";
import "firebase/database"
import { Stack, Form, Button, Row, Col, } from "react-bootstrap";

export const Channel = () => {
  let initialLoad: React.MutableRefObject<boolean> = useRef(false)
  let initialMessages: React.MutableRefObject<Array<any>> = useRef([])
  let topElement: any = useRef(null)
  let [gettingOldMessages, setGettingOldMessages, gettingOldMessagesRef] = useState(false)
  const location = useLocation();
  const user = useAuthProvider();
  const [channel, setChannel] = useState(location.pathname.split("/c/")[1])
  const [messages, setMessages, messagesRef ] = useState<Array<any>>([])
  const [error, setError] = useState<any>(null)
  const [message, setMessage] = useState<string>("")
  const [amountOfMessages, setAmountOfMessages, amountOfMessagesRef] = useState<number>(0)

  function smoothScrollBy( elem: HTMLElement | null, options: ScrollToOptions | undefined ) {
    return new Promise<void>( (resolve, reject) => {
      if( !( elem instanceof HTMLElement ) || typeof elem === null ) {
        throw new TypeError( 'Argument 1 must be an Element' );
      }
      let same = 0; // a counter
      // pass the user defined options along with our default
      const scrollOptions = Object.assign( {
        behavior: 'smooth',
        top: 0,
        left: 0
      }, options );
  
      // last known scroll positions
      let lastPosTop: any = elem.scrollTop;
      let lastPosLeft: any = elem.scrollLeft;
      // expected final position
      const maxScrollTop = elem.scrollHeight - elem.clientHeight;
      const maxScrollLeft = elem.scrollWidth - elem.clientWidth;
      const targetPosTop = Math.max( 0, Math.min(  maxScrollTop, Math.floor( lastPosTop + scrollOptions.top ) ) );
      const targetPosLeft = Math.max( 0, Math.min( maxScrollLeft, Math.floor( lastPosLeft + scrollOptions.left ) ) );
      
      function check() {
        // check our current position
        const newPosTop: any = elem?.scrollTop;
        const newPosLeft: any = elem?.scrollLeft;
        // we add a 1px margin to be safe
        // (can happen with floating values + when reaching one end)
        const atDestination = Math.abs( newPosTop - targetPosTop) <= 1 &&
          Math.abs( newPosLeft - targetPosLeft ) <= 1;
        // same as previous
        if( newPosTop === lastPosTop &&
          newPosLeft === lastPosLeft ) {
          if( same ++ > 2 ) { // if it's more than two frames
            if( atDestination ) {
              return resolve();
            }
            return reject();
          }
        }
        else {
          same = 0; // reset our counter
          // remember our current position
          lastPosTop = newPosTop;
          lastPosLeft = newPosLeft;
        }
        // check again next painting frame
        requestAnimationFrame( check );
      }
      // let's begin
      elem.scrollBy( scrollOptions );
      requestAnimationFrame( check );
      
      // this function will be called every painting frame
      // for the duration of the smooth scroll operation
      
    });
  }
  const topElementObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting === true) {
      console.log('Top element is fully visible in screen');
      if (gettingOldMessagesRef.current !== true) {
        if (messagesRef.current.length < amountOfMessagesRef.current) {
          console.log("now getting old messages")
          setGettingOldMessages(true)
          console.log(gettingOldMessagesRef.current)
        } else {
          console.log("all old messages got")
        }
        
      } else return;
    }
  }, { threshold: [1], });

  const isElementInViewport = (el: Element | null) => {
    if (el === null) {
      console.log("el = null")
      return
    }
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) 
    );
  }

  const sendMessage = (channel: any, message: string) => {
    const newMessageRef = push(getRef());
    const newMessageKey = newMessageRef.key;
    const updates: any = {};
    const sortTimestamp = 0 - new Date().getTime()
    const timestamp = new Date().getTime()
    updates[`/channels/${channel}/latestMessage`] = {
      key: newMessageKey,
      timestamp: timestamp,
      sortTimestamp: sortTimestamp,
      text: message,
      name: user.displayName || user.email
    };
    updates[`/messages/${channel}/messages/${newMessageKey}`] = {
      timestamp: timestamp,
      sortTimestamp: sortTimestamp,
      text: message,
      name: user.displayName || user.email,
      key: newMessageKey
    };
    updates[`/messages/${channel}/amountOfMessages`] = increment(1);
    update(getRef(), updates)
      .then(() => {
        console.log("update successful")
      })
      .catch((error) => {
        console.log(error)
        setError(error)
      })
  }
  const getOldMessages = async () => {
    if (messagesRef.current.length < amountOfMessagesRef.current) {
      let DBMessagesRef = getRef(`/messages/${location.pathname.split("/c/")[1]}/messages`)
      let DBMessageQuery = query(DBMessagesRef, orderByChild("sortTimestamp"), startAfter(messagesRef.current[0].sortTimestamp), limitToFirst(15))
      let data: Array<any> = []
      await get(DBMessageQuery).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          data = [childSnapshot.val(), ...data]
        })
      })
      console.log(data)
      return data
    } else {
      return []
    }
    
  }
  const getNewMessage = (snapshot: DataSnapshot) => {
    if (initialLoad.current === true && gettingOldMessagesRef.current === false) {
      let m = [...messagesRef.current, snapshot.val()]
      setMessages(m)
      console.log("bruh")
      console.log(snapshot.val())
    }
  }
  const getInitialMessages = (snapshot: DataSnapshot) => {
    let newM = [snapshot.val(), ...initialMessages.current]
    initialMessages.current = newM
    if (initialMessages.current.length >= amountOfMessagesRef.current || initialMessages.current.length >= 15) {
      off(query(getRef(`/messages/${location.pathname.split("/c/")[1]}/messages`), orderByChild("sortTimestamp"), limitToFirst(15), ), undefined,  getInitialMessages)
      
      setMessages(newM)
    }
  }

  useEffect(() => {
    console.log("gettingOldMessages useEffect called")
    if (gettingOldMessagesRef.current === true ) {
      getOldMessages().then((data) => {
        console.log(data)
        if (data.length > 0) {
          setMessages([...data, ...messagesRef.current]);
        }
        topElementObserver.unobserve(topElement.current);
        setGettingOldMessages(false)
      }
      ).catch((error) => {
        console.log(error)
        setError(error)
      }
      )
    }
  }, [gettingOldMessages])

  useEffect(() => {
    if (messagesRef.current.length > 0) {
      console.log(messagesRef.current)
      let el = document.getElementById("messagesBox")
      let el2 = document.getElementById(messagesRef.current[messagesRef.current.length - 1].key)
      let el3 = document.getElementById(messagesRef.current[0].key)
      topElement.current = el3
      console.log(el)
      console.log(el2)
      console.log(el2?.offsetTop)
      console.log(document.getElementById(messagesRef.current[messagesRef.current.length - 1].key));
      if (messagesRef.current.length >= 15 || messagesRef.current.length === amountOfMessagesRef.current) {
        if (initialLoad.current === false) {
          smoothScrollBy(el, {top: el2?.offsetTop})
            .then(() => {
              console.log("scrolled")
              initialLoad.current = true
              if (messagesRef.current.length < amountOfMessagesRef.current ) {
                console.log("there is more messages behind")
                console.log(topElement.current)
                topElementObserver.observe(topElement.current)
              }
            })
        } else {
          console.log(document.getElementById(messagesRef.current[messagesRef.current.length - 3].key))
          if (isElementInViewport(document.getElementById(messagesRef.current[messagesRef.current.length - 3].key)) === true) {
            el2?.scrollIntoView({ behavior: "smooth", block: "end" })
          }
        }
      }
    }
  }, [messages])

  useEffect(() => {
    console.log("component mounted")
    return () => {console.log("component unmounted")}
  }, [])

  useEffect(() => {
    topElementObserver.disconnect()
    console.log("------------------------------------------------------")
    console.log("------------------------------------------------------")
    console.log("------------------------------------------------------")
    off(getRef(`/messages/${channel}/amountOfMessages`))
    off(getRef(`/messages/${channel}/messages`))
    setMessages([])
    setGettingOldMessages(false)
    topElement.current = null
    initialLoad.current = false
    initialMessages.current = []
    setAmountOfMessages(0)
    console.log(messages)
    setError(null)
    console.log("Channel: " + location.pathname.split("/c/")[1])
    setChannel(location.pathname.split("/c/")[1]);
    onValue(getRef(`/messages/${location.pathname.split("/c/")[1]}/amountOfMessages`), (snapshot) => {
      console.log(amountOfMessages)
      console.log(amountOfMessagesRef.current)
      setAmountOfMessages(snapshot.val())
    })

    onChildAdded(query(getRef(`/messages/${location.pathname.split("/c/")[1]}/messages`), orderByChild("sortTimestamp"), limitToFirst(15), ), getInitialMessages)
    onChildAdded(query(getRef(`/messages/${location.pathname.split("/c/")[1]}/messages`), orderByChild("sortTimestamp"), limitToFirst(1), ), getNewMessage)

    return () => {
      off(getRef(`/messages/${location.pathname.split("/c/")[1]}/messages`))
      off(getRef(`/messages/${location.pathname.split("/c/")[1]}/amountOfMessages`))
    }
  }, [location])
  return (
    <div className="messagePage">
      <Row>
        <div className="channelInfo">
          <h1>Channel: {channel}</h1>
          {error ? <p>{error.code}: {error.message}</p> : null}
        </div>
      </Row>
      <Row className="messages" id="messagesBox">
        {messagesRef.current.length > 0
          ? 
          <Stack gap={3}>
            {messages.map((m: any, i: any) => {return (
              <div className="message" key={i} id={m.key}>
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
          : 
          null
        }
      </Row>
      <Row>
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
              <Col lg="auto" md="auto" xs="auto" sm="auto" xl="auto" xxl="auto">
                <Button type="submit" value="Submit">
                  Send message
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Row>
    </div>
  )
  //return (
  //  <div className="messagePage">
  //    <Row>
  //      <div className="channelInfo">
  //        <h1>Channel: {channel} <button onClick={() => sendMessage(location.pathname.split("/c/")[1], "test")}></button></h1>
  //        {error ? <p>{error.code}: {error.message}</p> : null}
  //      </div>
  //    </Row>
  //    {messages.length > 0 && messages 
  //      ?
  //      <>
  //        <Row>
  //          <div className="messages" id="messagesBox">
  //            <Stack gap={3}>
  //              {messages.map((m: any, i: any) => {return (
  //                <div className="message" key={i} id={m.key}>
  //                  <span className="timestamp">
  //                    ({new Date(
  //                      new Date(m.timestamp).setMinutes(
  //                        new Date(m.timestamp).getMinutes() -
  //                          new Date(m.timestamp).getTimezoneOffset()
  //                      )
  //                    ).toUTCString()})
  //                  </span>
  //                  <span className="user">
  //                    {m.name}:
  //                  </span>
  //                  <div className="text">
  //                    {m.text}
  //                  </div>  
  //                </div>
  //              )})}
  //            </Stack>
  //          </div>
  //        </Row>
  //        <Row>
  //          <Container fluid className="messageForm">
  //            <div className="messageForm">
  //              <Form onSubmit={(event) => {
  //                sendMessage(channel, message);
  //                setMessage("");
  //                event.preventDefault();
  //              }}
  //              >
  //                <Row className="align-items-center">
  //                  <Col>
  //                    <Form.Control 
  //                      type="text"
  //                      placeholder="..." 
  //                      name="message" 
  //                      id="message"  
  //                      value={message}
  //                      onChange={(e) => setMessage(e.target.value)}
  //                    >
  //                    </Form.Control>
  //                  </Col>
  //                  <Col md="auto">
  //                    <Button type="submit" value="Submit">
  //                      Send message
  //                    </Button>
  //                  </Col>
  //                </Row>
  //              </Form>
  //            </div>
  //            
  //          </Container>
  //        </Row>
  //      </>
  //      : null
  //    }
  //  </div>
  //)
}
