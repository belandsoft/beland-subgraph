import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ERC20/ERC20"; // Import hợp đồng ERC20
import { User, TokenBalance } from "../generated/schema"; // Import các thực thể

export function handleTransfer(event: Transfer): void {
  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let value = event.params.value;
  let tokenAddress = event.address.toHex(); // Địa chỉ token từ sự kiện

  // Cập nhật số dư cho người gửi
  updateBalance(from, tokenAddress, value.neg());
  
  // Cập nhật số dư cho người nhận
  updateBalance(to, tokenAddress, value);
}

function updateBalance(userId: string, tokenAddress: string, amount: BigInt): void {
  // Tạo hoặc cập nhật thực thể User
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
  }

  // Tìm thực thể TokenBalance tương ứng
  let tokenBalanceId = userId + "-" + tokenAddress; // Tạo ID duy nhất cho mỗi user-token
  let tokenBalance = TokenBalance.load(tokenBalanceId);

  if (tokenBalance == null) {
    tokenBalance = new TokenBalance(tokenBalanceId);
    tokenBalance.user = user.id;
    tokenBalance.tokenAddress = tokenAddress;
    tokenBalance.balance = BigInt.fromI32(0);
  }

  // Cập nhật số dư
  tokenBalance.balance = tokenBalance.balance.plus(amount);
  
  // Lưu thực thể
  tokenBalance.save();
  
  // Lưu lại user
  user.save();
}
