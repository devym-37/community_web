import { convertDateFormat } from "@/utils/dateUtils";

import { CommentForm } from "@/components/postDetail/CommentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCommentManager } from "@/hooks/postDetail/useCommentManager";
import { usePostManager } from "@/hooks/postDetail/usePostManage";
import { BASE_COMMENT } from "@/types/api/commentApi";
import { PostDetail_Response } from "@/types/api/postApi";
import { getParamsFromFormData } from "@/utils/common";
import dynamic from "next/dynamic";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";

const ContentEditor = dynamic(
  () => import("@/components/common/ContentEditor"),
  {
    ssr: false,
  }
);

export default function PostDetail({
  data,
  isOpen,
  setOpen,
}: {
  data: PostDetail_Response;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [openUpdateDrawer, setOpenUpdateDrawer] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);

  const { postContent, handleRemove, getToken, handleUpdate, onEditContent } =
    usePostManager(data, setOpenUpdateDrawer);

  const {
    comments,
    reCommentList,
    setCommentId,
    handleCommentSubmit,
    getReComment,
    getCommentList,
  } = useCommentManager(data, setOpenCommentDialog);

  const checkUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = getParamsFromFormData(new FormData(e.currentTarget));

    await getToken({
      password: params.password,
      postId: data.postId,
    });

    setOpenAuthDialog(false);
    setOpenUpdateDrawer(true);
  };

  return (
    <>
      <div className="h-20 flex items-center justify-center mt-20">
        <h1 className="text-black text-3xl">{data.title}</h1>
      </div>

      {/* 카드 형식의 컨텐츠 */}
      <div className="max-w mx-auto  sm:p-5">
        <div className="bg-white p-8 rounded-lg shadow-lg mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
            <div className="text-base font-medium text-gray-700">
              <span>작성자: {postContent.creator}</span>
              <span className="mx-3">•</span>
              <span>조회수: {postContent.viewCount}</span>
            </div>

            <div className="text-base text-gray-600">
              작성일:{" "}
              {postContent.createdAt
                ? convertDateFormat(postContent.createdAt)
                : "알 수 없음"}
            </div>
          </div>
          <div className="text-base font-medium text-gray-700  mb-6">
            카테고리: {postContent.category}
          </div>

          <div
            className="text-gray-800 text-lg"
            dangerouslySetInnerHTML={{ __html: postContent.content }}
            suppressHydrationWarning
          />
        </div>

        <div className="mb-20">
          <Dialog open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">수정</Button>
            </DialogTrigger>

            <DialogContent>
              <form onSubmit={checkUser}>
                <Input
                  placeholder="비밀번호"
                  name="password"
                  type="text"
                  className="mt-6"
                  required
                />
                <DialogFooter>
                  <Button type="submit" variant="destructive" className="mt-4">
                    확인
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-2">
                삭제
              </Button>
            </DialogTrigger>

            <DialogContent>
              <form onSubmit={handleRemove}>
                <Input
                  placeholder="비밀번호"
                  name="password"
                  type="text"
                  className="mt-6"
                  required
                />
                <DialogFooter>
                  <Button type="submit" variant="destructive" className="mt-4">
                    확인
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-between">
          <div className="my-auto">댓글</div>

          <Dialog open={openCommentDialog} onOpenChange={setOpenCommentDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setCommentId(null)} size="sm">
                댓글 작성
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CommentForm handleSubmit={handleCommentSubmit} />
            </DialogContent>
          </Dialog>
        </div>
        <Separator className="mb-2 mt-1" />
        {/* 댓글 목록 */}
        {comments?.content?.map((content) => {
          const hasReComment =
            Math.max(
              content.childrenCommentCount,
              reCommentList[content.commentId]?.elementsCount ?? 0
            ) > (reCommentList[content.commentId]?.content?.length ?? 0);

          return (
            <div key={content.commentId} className="mb-12 mt-4">
              <div className="flex flex-row justify-between mb-4">
                <div>
                  <div className="flex flex-row mb-1">
                    <div className="text-xs">@</div>
                    <div className="text-xs font-bold">{content.creator}</div>
                    <div className="text-gray-500 text-xs ml-1">
                      {content.createdAt
                        ? convertDateFormat(content.createdAt)
                        : "알 수 없음"}
                    </div>
                  </div>

                  <p className="text-base">{content.content}</p>
                </div>

                <Dialog
                  open={openCommentDialog}
                  onOpenChange={setOpenCommentDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setCommentId(content.commentId)}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold"
                    >
                      답글
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <CommentForm handleSubmit={handleCommentSubmit} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* 대댓글 목록 */}
              {reCommentList[content.commentId]?.content?.map(
                (reply: BASE_COMMENT) => {
                  return (
                    <div key={reply.commentId} className="ml-4 my-4">
                      <div className="flex flex-row mb-1">
                        <div className="text-xs">@</div>
                        <div className="text-xs font-bold">{reply.creator}</div>
                        <div className="text-gray-500 text-xs ml-1">
                          {reply.createdAt
                            ? convertDateFormat(reply.createdAt)
                            : "알 수 없음"}
                        </div>
                      </div>

                      <p className="text-base">{reply.content}</p>
                    </div>
                  );
                }
              )}

              {hasReComment && (
                <div>
                  <Button
                    onClick={() => getReComment(content.commentId)}
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold"
                  >
                    답글 보기
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {comments?.elementsCount > (comments?.content?.length || 0) && (
          <div>
            <Button
              onClick={() => getCommentList()}
              variant="ghost"
              size="sm"
              className="text-xs font-bold"
            >
              댓글 더 보기
            </Button>
          </div>
        )}

        <Drawer open={openUpdateDrawer} onOpenChange={setOpenUpdateDrawer}>
          <DrawerContent className="max-h-[84%]">
            <form
              onSubmit={handleUpdate}
              className="p-10 overflow-auto mx-auto w-full max-w-[767px]"
            >
              <div className="text-slate-400 text-xs mb-1 ml-1">카테고리</div>
              <Select name="category" defaultValue={postContent.category}>
                <SelectTrigger className="mb-4 data-[placeholder]:text-slate-400">
                  <SelectValue placeholder="선택해 주세요" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>카테고리</SelectLabel>
                    <SelectItem value="ad">홍보</SelectItem>
                    <SelectItem value="question">질문</SelectItem>
                    <SelectItem value="consulting">상담</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="text-slate-400 text-xs mb-1 ml-1">제목</div>
              <Input
                defaultValue={postContent.title}
                name="title"
                type="text"
                className="mb-4"
                required
              />

              <ContentEditor
                onEditContent={onEditContent}
                defaultValue={postContent.content}
              />
              <DialogFooter>
                <Button type="submit" className="mt-4">
                  완료
                </Button>
              </DialogFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
