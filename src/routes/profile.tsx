import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import { collection, getDocs, limit, orderBy, query, where, } from "firebase/firestore";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;

const BtnArea = styled.div`

`;

const NameArea  = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  font-size: 18px;
  padding: 5px;
  margin-bottom: 5px;
`;

const Tweets = styled.div `
  display:flex;
  width:100%;
  flex-direction: column;
  gap: 10px;
`;

const ActionBtnArea = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

const EditBtn = styled.button`
  background-color: orange;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 3px;
`;

const CancelBtn = styled.button`
  background-color: grey;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
`;

const SaveBtn = styled.button`
  background-color: orange;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [isEditing, setEditing] = useState(false);
    const [name, setName] = useState(user?.displayName);
    const onAvatarChange =async (e:React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if(!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL: avatarUrl,
            });
        }
    };

    const onEdit = async() => {
        setEditing(true);
    };

    const onSave = async () => {
        if (!user || name === "") return;
        try {
            await updateProfile(user, { displayName: name });
        } catch {

        } finally {
            setEditing(false);
        }
    };

    const onCancel = async() => {
        setName(user?.displayName)
        setEditing(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const fetchTweets = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc) => {
            const { tweet, createdAt, userId, username, photo } = doc.data();
                return {
                    tweet,
                    createdAt,
                    userId,
                    username,
                    photo,
                    id: doc.id,
                };
            });
            setTweets(tweets);
        };
    useEffect(() => {
        fetchTweets();
    }, []);
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar"> 
                {avatar ? (<AvatarImg src={avatar} /> ) : ( 
                <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>)}
            </AvatarUpload>
            <AvatarInput
                onChange={onAvatarChange}
                id="avatar"
                type="file"
                accept="image/*"
            />
            <NameArea>
                {isEditing ? (
                    <Input
                    value={name ?? ""}
                    onChange={onChange}
                    placeholder="Write New Name"
                    required
                  />
                ) : ( <Name> 
                        {user?.displayName ?? "Anonymous"}
                    </Name>)
                }
                <BtnArea>
                    {isEditing ? (
                            <ActionBtnArea>
                                <CancelBtn onClick = {onCancel}>Cancel</CancelBtn>
                                <SaveBtn onClick = {onSave}>Save</SaveBtn>
                            </ActionBtnArea>
                        ) : (
                            <EditBtn onClick = {onEdit}>Edit</EditBtn>
                    )}
                </BtnArea>
            </NameArea>
            <Tweets>
                {tweets.map((tweet) => (
                    <Tweet key={tweet.id} {...tweet} />
                ))}
            </Tweets>
        </Wrapper>
    );
}