import { useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {    id: 933372,
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
  const [isSelected , setisSelected]= useState(null); //We did this so further to input the object onto form split bill
  //Not the boolean in isselected , because , to get which guy selected as i have to pass that into form split bill
 
  return (
    <>
    <Header />
    <div className="app">
    <div className="sidebar">
      <FriendList add={add} setadd={setadd} setisSelected={setisSelected} isSelected={isSelected} />
      {isOPen ? <FormAddFriend setadd={setadd} add={add}
     /> : <span></span>}
      <Button setisOPen={setisOPen} isOPen={isOPen} />
      
      
      
    </div>
     {isSelected ? <FormSplitBill isSelected={isSelected} setadd={setadd} add={add} /> : <span></span>}
    </div>
    </>
  )
}
export default App
function Header(){
  return <h1>SPLIT BILLS</h1>
}

function FriendList({add,setadd,setisOPen,setisSelected,isSelected}){
   

  

  return (
  <ul>
    {add.map((el)=>(
      <Friend friend={el} key={el.id} add={add} setadd={setadd} 
       setisSelected={setisSelected} isSelected={isSelected}/>
    ))}
  </ul>
  )

}
function Friend({friend,add,setadd,setisSelected,isSelected}){
  
  function Selecto(){
    return(
      setisSelected(friend)
    )
  }
  function DeleteGuy(id){
    const Deleted = add.filter((item)=> item.id !== id )
    setadd(Deleted)

     if (isSelected?.id === id) {
      setisSelected(null)
    }
  }

  
  const absBalance = friend.balance < 0 ? Math.abs(friend.balance) : null;
 
  return( 
    <>

  <li>
    <img src={friend.image} alt={friend.name}/>
    <h3>{friend.name}</h3>
    <button className="button" onClick={Selecto}>Select</button>
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
        image: imageurl,
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
function FormSplitBill({isSelected,setadd,add}) {
const [bill, setBill] = useState("");
const [yourExpense, setYourExpense] = useState("");
const [whoPays, setWhoPays] = useState("user");

function handlesplit(e){
  e.preventDefault();

  if(yourExpense>bill)return;

 
  whoPays == "user" ? isSelected.balance=  isSelected.balance +bill - yourExpense :  isSelected.balance=  isSelected.balance - yourExpense
  const update= add.map((item)=>(
    item.id===isSelected.id ? {...item, balance:  isSelected.balance } : item
  ))
  setBill("");
  setYourExpense("");
  setWhoPays("user");
  return (
   setadd(update)
  )
}
  return (
    <form className="form-split-bill">
      <h2>Split a bill with {isSelected.name} </h2>

      <label>💰 Bill value</label>
      <input type="text" value={bill} onChange={(e)=>setBill(Number(e.target.value))}/>

      <label>🧍 Your expense</label>
      <input type="text" value={yourExpense} onChange={(e)=>setYourExpense(Number(e.target.value))} />

      <label>👫 {isSelected.name}'s expense</label>
      <input type="text" disabled  value={bill - yourExpense}/>

      <label>🤑 Who is paying the bill</label>
      <select
      value={whoPays}
      onChange={(e)=>setWhoPays(e.target.value)}>
        <option value="user">You</option>
        <option value={isSelected.name}>{isSelected.name}</option>
      </select>

      <button className="button"  onClick={handlesplit}>Split Bill</button>
    </form>
  );
}