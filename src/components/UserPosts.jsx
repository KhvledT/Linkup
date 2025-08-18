import { useQuery } from '@tanstack/react-query'
import Post from './Post'
import { getUserPosts } from '../Services/UserDetailsServices'



export default function UserPosts({userID}) {

    const { data, isLoading, refetch, isFetching ,error ,isError } = useQuery({
        queryKey: ['userPosts'],
        queryFn: () => getUserPosts(userID),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: 2,
        staleTime : 30000,
    })

    return (
      <>
        {isLoading ? (
          ''
        ) : isError ? (
          ''
        ) : (
          [...(data.data.posts || [])].reverse().map((post) => (
            <div className='mb-4' key={post.id}>
                <Post
                    post={post}
                    getUserPosts={refetch}
                    commentLimit={post.comments?.length || 0}
                    from={'userProfilePage'}
                />
            </div>
          ))
        )}
      </>
    );
    
}
