/* eslint-disable @typescript-eslint/no-shadow */
import { 
  Navbar, 
  Offcanvas, 
  Nav, 
  Form, 
  Button,
  Modal,
  Row,
  Col
} from "react-bootstrap";
import {
  LinkContainer
} from "react-router-bootstrap"
import {
  useEffect,
  useState,
} from "react"
import {
  signInUser,
  signUpUser,
  signOutUser,
} from "./firebase/functions/auth";
import {
  useAuthProvider
} from "./firebase/context/auth"
import {
  getRef
} from "./firebase/functions/database";
import {
  onValue
} from "firebase/database"
import {
  useNavigate
} from "react-router-dom"

const LoginOffcanvas = (props: any) => {
  const state = props.state;
  const setState = props.setState;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <Offcanvas show={state} onHide={() => setState(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Login</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button type="button" onClick={() => signInUser(email, password)}>
              Login
            </Button>
            <Button type="button" onClick={() => signUpUser(email, password)}>
              Sign up
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};
const ChannelsOffcanvas = (props: any) => {
  const navigate = useNavigate()
  const user = useAuthProvider() || {displayName: "", email: ""};
  const [modalStatus, setModalStatus] = useState<boolean>(false)
  const [newChannelName, setNewChannelName] = useState<string>("")
  const [newChannelMembers, setNewChannelMembers] = useState<Array<any>>([user.uid])
  const [newChannelMember, setNewChannelMember] = useState<string>("")
  //const [channelNameIsAvaliable, setchannelNameIsAvaliable] = useState<boolean>(false)
  const status = props.status
  const setStatus = props.setStatus
  const channels = props.channels
  const error = props.error

  useEffect(() => {
    if (newChannelName.trim() !== "") {
      console.log("channel name")
    }
  }, [newChannelName])
  const handleNewChannelNameChange = (e: any) => {
    setNewChannelName(e.target.value)
  }

  const handleNewChannelSubmit = (e: any) => {
    console.log(e)
    e.preventDefault()

  }

  const handleNewChannelMember = (e: any) => {
    console.log(e)
    setNewChannelMember(e.target.value)
  }
  return (
    <>
      <Offcanvas show={status} onHide={() => setStatus(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{user.displayName || user.email}'s Channels</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {error 
            ? <p>
              Error
            </p> 
            : <>
              {channels.length > 0 
                ? channels.map((channel: any, i: number) => (
                  <div key={i}>
                    <Button variant="primary" onClick={() => {
                      console.log(`Navigating to channel ${channel.name}`)
                      navigate(`/c/${channel.name}`)
                      setStatus(false)
                    }}>
                      {channel.name}
                    </Button>
                    <br/>
                  </div>
                ))
                : <p>No channels</p>} 
              
            </>
          }
          <Button onClick={() => setModalStatus(true)}>
            test modal
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
      <Modal show={modalStatus} onHide={() => setModalStatus(false)} size={"xl"}>
        <Modal.Header closeButton>
          <Modal.Title>
            Create new channel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNewChannelSubmit}>
            <Form.Group as={Row} className="mb-3">
              <Col>
                <Form.Floating id="ChannelName">
                  <Form.Control
                    type="text"
                    placeholder="Channel Name"
                    value={newChannelName}
                    onChange={handleNewChannelNameChange}
                    
                  />
                  <label htmlFor="ChannelName">Channel Name</label>
                </Form.Floating>
              </Col>
              <Col xs="2">
                This name is avaliable 
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs="2">
                Add members: 
              </Form.Label>
              <Col>
                <Form.Control
                  type="text"
                  value={newChannelMember}
                  onChange={handleNewChannelMember}
                />
                <Button onClick={() => setNewChannelMembers([ ...newChannelMembers, newChannelMember,])}>Add</Button>
              </Col>
              <Col xs="4">
                {newChannelMembers ? newChannelMembers.map((c, i) => (
                  <div key={i}>
                    {c}
                  </div>
                )) : null}
              </Col>
              
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={(e) => handleNewChannelSubmit(e)}>Submit</Button><Button onClick={() => setModalStatus(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </> 
  )
}

export const AppNavbar = () => {
  const user = useAuthProvider();
  const navigate = useNavigate();
  const loggedIn = user !== null ? true : false;
  const [channels, setChannels] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);
  const [loginOCStatus, setLoginOCStatus] = useState<Boolean>(false);
  const [channelsOCStatus, setChannelsOCStatus] = useState<Boolean>(false);
  const signUserOut = () => {
    signOutUser();
    navigate("/");
  }
  useEffect(() => {
    if (user) {
      setLoginOCStatus(false)
      let ref = getRef(`users/${user.uid}/channels`);
      let Channels = onValue(ref, (snapshot) => {
        if (snapshot.val()) {
          let data: any = [];
          let x = snapshot.val()
          console.log(x)
          let keys = Object.keys(x);
          for (let i = 0; i < keys.length; i++) {
            data.push({id: i, name: keys[i], status: x[keys[i]]});
          }
          setChannels(data);
        }
      }, (error) => {
        console.log(error);
        setError(error)
      })
      return () => {
        Channels();
      }
    }
  }, [user])
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="testing438 position-absolute w-100">
        <Navbar.Brand>
          <LinkContainer to="/">
            <div>VSV Chat App</div>
          </LinkContainer>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
          <Nav className="mr-auto">
            {loggedIn ? (
              <>
                <Nav.Link onClick={() => setChannelsOCStatus(true)}>Channels</Nav.Link>
                <Nav.Link onClick={() => signUserOut()}>Signout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link onClick={() => setLoginOCStatus(true)}>Login</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <LoginOffcanvas state={loginOCStatus} setState={setLoginOCStatus} />
      <ChannelsOffcanvas status={channelsOCStatus} setStatus={setChannelsOCStatus} channels={channels} error={error}/>
    </>
  )
}