import { Fragment, useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

function App(){
  const [add , setadd] = useState(initialFriends);
  const [isOPen , setisOPen]=useState(false);
  const [selected, setselected] = useState([]); // ARRAY now, not a single friend

  function toggleSelect(friend){
    setselected((prev)=>
      prev.some((f)=>f.id===friend.id)
        ? prev.filter((f)=>f.id!==friend.id)
        : [...prev, friend]
    )
  }

  return (
    <>
    <Header />
    <div className="app">
    <div className="sidebar">
      <FriendList add={add} setadd={setadd} selected={selected} setselected={setselected} toggleSelect={toggleSelect} />
      {isOPen ? <FormAddFriend setadd={setadd} add={add}
     /> : <span></span>}
      <Button setisOPen={setisOPen} isOPen={isOPen} />
    </div>
     {selected.length > 0 ? <FormSplitBill selected={selected} setadd={setadd} add={add} setselected={setselected} /> : <span></span>}
    </div>
    </>
  )
}
export default App;

function Header(){
  return <h1>SPLIT BILLS</h1>
}

function FriendList({add,setadd,selected,setselected,toggleSelect}){
  return (
  <ul>
    {add.map((el)=>(
      <Friend friend={el} key={el.id} add={add} setadd={setadd} 
       selected={selected} setselected={setselected} toggleSelect={toggleSelect}/>
    ))}
  </ul>
  )
}

function Friend({friend,add,setadd,selected,setselected,toggleSelect}){

  function DeleteGuy(id){
    const Deleted = add.filter((item)=> item.id !== id )
    setadd(Deleted)
    // also drop them from the current selection if they were part of it
    setselected((prev)=>prev.filter((f)=>f.id!==id))
  }

  const isChecked = selected.some((f)=>f.id===friend.id)
  const absBalance = friend.balance < 0 ? Math.abs(friend.balance) : null;

  return( 
    <>
  <li className={isChecked ? "selected" : ""}>
    <img src={friend.image} alt={friend.name}/>
    <h3>{friend.name}</h3>
    <button className="button" onClick={()=>toggleSelect(friend)}>{isChecked ? "Selected" : "Select"}</button>
    <p className= {friend.balance<0 ? "red" : friend.balance>0 ? "green" : " " }>
      {friend.balance < 0 ? `You owe ${friend.name} ${absBalance} dollars`
      : friend.balance > 0 ? `${friend.name} owes you ${friend.balance} dollars`
      : `You and ${friend.name} are in even`
  }
    </p>
    {friend.balance === 0 ? <button className="button" onClick={()=>DeleteGuy(friend.id)}>🗑️</button> : <span></span>}
    </li>
   </>
)
}

function Button ({setisOPen,isOPen}){
  function clicked(){
    return (
      setisOPen((s)=>!s)
    )
  }
  return (
  <button className="button" onClick={clicked}> {isOPen ? "Close" : "Add Friend" } </button>
  )
}

function FormAddFriend({setadd ,add}){
  const [item , setitem]= useState("")
  const[imageurl, setimageurl]=useState("")

  function NewAdd(e){
    e.preventDefault()
    if(!item)return;
    const obj= {
        id: Date.now(),
        name: item,
        image: imageurl || `https://i.pravatar.cc/48?u=${Date.now()}`,
        balance: 0
      }
    return (
    setadd([...add,obj]),
    setitem(""),
    setimageurl("")
    )
  }
  
  return (
    <form className="form-add-friend">
      <label>Friend Name</label>
      <input type="text" value={item} onChange={(e)=>setitem(e.target.value)} />
      <label>Image Url</label>
      <input type="text" value={imageurl}  onChange={(e)=>setimageurl(e.target.value)}  />
       <button className="button" onClick={NewAdd} >Add</button>
    </form>
  )
}

function FormSplitBill({selected,setadd,add,setselected}) {
  const [bill, setBill] = useState("");
  const [splitType, setSplitType] = useState("equal"); // "equal" | "custom"
  const [whoPays, setWhoPays] = useState("me");
  const [customAmounts, setCustomAmounts] = useState({});
  const [error, setError] = useState("");

  // everyone in this bill = You + every selected friend
  const people = [{ id: "me", name: "Me" }, ...selected];
  const equalShare = bill ? bill / people.length : 0;

  function getAmount(personId){
    if(splitType === "equal") return equalShare;
    return Number(customAmounts[personId]) || 0;
  }

  function handleCustomChange(personId, value){
    setCustomAmounts((prev)=>({...prev, [personId]: value}));
  }

  function handlesplit(e){
    e.preventDefault();
    setError("");

    if(!bill || bill <= 0) return;

    if(splitType === "custom"){
      const sum = people.reduce((s,p)=> s + (Number(customAmounts[p.id]) || 0), 0);
      if(Math.abs(sum - bill) > 0.01){
        setError(`Amounts add up to ${sum}, but the bill is ${bill}. They must match to split.`);
        return;
      }
    }

    const amounts = {};
    people.forEach((p)=> amounts[p.id] = getAmount(p.id));

    const update = add.map((friend)=>{
      const isParticipant = selected.some((f)=>f.id===friend.id);
      if(!isParticipant) return friend;

      if(whoPays === "me"){
        // you paid -> this friend now owes you their share
        return {...friend, balance: friend.balance + amounts[friend.id]};
      }

      if(whoPays === String(friend.id)){
        // this friend paid -> you owe them your ("me") share
        return {...friend, balance: friend.balance - amounts["me"]};
      }

      // a different selected friend paid — friend-to-friend debt,
      // this app only tracks balances between you and each friend
      return friend;
    })

    setadd(update);
    setBill("");
    setCustomAmounts({});
    setSplitType("equal");
    setWhoPays("me");
    setselected([]);
  }

  const names = selected.map((f)=>f.name).join(", ");

  return (
    <form className="form-split-bill">
      <h2>Split a bill with {names}</h2>

      <label>💰 Bill value</label>
      <input type="text" value={bill} onChange={(e)=>setBill(Number(e.target.value))}/>

      <label>⚖️ Split type</label>
      <select value={splitType} onChange={(e)=>{ setSplitType(e.target.value); setError(""); }}>
        <option value="equal">Equal split</option>
        <option value="custom">Custom amounts</option>
      </select>

      {people.map((p)=>(
        <Fragment key={p.id}>
          <label>{p.name}</label>
          <input
            type="text"
            disabled={splitType==="equal"}
            value={splitType==="equal" ? equalShare.toFixed(2) : (customAmounts[p.id] ?? "")}
            onChange={(e)=>handleCustomChange(p.id, e.target.value)}
          />
        </Fragment>
      ))}

      {error && <p className="red split-error">{error}</p>}

      <label>🤑 Who is paying the bill</label>
      <select
      value={whoPays}
      onChange={(e)=>setWhoPays(e.target.value)}>
        <option value="me">You</option>
        {selected.map((f)=>(
          <option value={String(f.id)} key={f.id}>{f.name}</option>
        ))}
      </select>

      <button className="button" onClick={handlesplit}>Split Bill</button>
    </form>
  );
}