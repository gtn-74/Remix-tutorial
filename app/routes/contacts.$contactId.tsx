import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { ContactRecord, getContact } from "../data";
import invariant from "tiny-invariant";
import { FunctionComponent } from "react";

// 動的ルーティング的な
// rootファイルの命名 https://remix.run/docs/en/main/file-conventions/routes#route-file-naming

// loaderは非同期関数
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // 普遍条件を違反した時の処遇 https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Meta_programming#%E4%B8%8D%E5%A4%89%E6%9D%A1%E4%BB%B6_invariant
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

// export const action = async ({ params, request }: ActionFunctionArgs) => {
//   invariant(params.contactId);
// };

export default function Contact() {
  // apiからdata取得
  const { contact } = useLoaderData<typeof loader>();

  // sample data
  //   const contact = {
  //     first: "Your",
  //     last: "Name",
  //     // リモートで繋いでる
  //     avatar: "https://placekitten.com/200/200",
  //     twitter: "your_handle",
  //     notes: "Some notes",
  //     favorite: true,
  //   };

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
};
